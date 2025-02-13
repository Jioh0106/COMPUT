package com.deepen.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepen.domain.QualityInspectionDTO.InspectionResultDTO;
import com.deepen.domain.QualityInspectionDTO.LotInspectionDTO;
import com.deepen.domain.QualityInspectionDTO.LotInspectionResultDTO;
import com.deepen.domain.QualityInspectionDTO.QcItemDTO;
import com.deepen.mapper.QualityInspectionMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QualityInspectionService {

    private final QualityInspectionMapper qualityInspectionMapper;

    /**
     * 검사대상 LOT 목록 조회
     */
    public List<LotInspectionDTO> getInspectionLots(String lotNo, String wiNo, Long processNo) {
        try {
            log.info("검사대상 LOT 조회 - lotNo: {}, wiNo: {}, processNo: {}", lotNo, wiNo, processNo);
            return qualityInspectionMapper.selectInspectionLots(lotNo, wiNo, processNo);
        } catch (Exception e) {
            log.error("검사대상 LOT 조회 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * LOT별 검사항목 조회
     */
    public List<QcItemDTO> getQcItems(String lotNo) {
        try {
            log.info("LOT 검사항목 조회 - lotNo: {}", lotNo);
            return qualityInspectionMapper.selectQcItems(lotNo);
        } catch (Exception e) {
            log.error("LOT 검사항목 조회 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * 검사결과 저장 및 LOT 상태 업데이트
     */
    @Transactional
    public LotInspectionResultDTO saveInspectionResults(List<InspectionResultDTO> results) {
        try {
            if (results == null || results.isEmpty()) {
                throw new IllegalArgumentException("검사 결과가 없습니다.");
            }

            String lotNo = results.get(0).getLotNo();
            String inspector = results.get(0).getInspector();
            boolean hasFailure = false;

            // 각 검사결과 저장 및 판정 처리
            for (InspectionResultDTO result : results) {
                // 검사결과 저장 전 측정값에 따른 판정 처리
                if (result.getMeasureValue() != null) {
                    QcItemDTO qcItem = getQcItems(lotNo).stream()
                        .filter(item -> item.getQcCode().equals(result.getQcCode()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("검사 항목을 찾을 수 없습니다."));

                    boolean isPass = true;
                    if (qcItem.getUcl() != null && result.getMeasureValue() > qcItem.getUcl()) {
                        isPass = false;
                    }
                    if (qcItem.getLcl() != null && result.getMeasureValue() < qcItem.getLcl()) {
                        isPass = false;
                    }
                    result.setJudgment(isPass ? "Y" : "N");
                    
                    if (!isPass) {
                        hasFailure = true;
                    }
                }

                qualityInspectionMapper.insertQcResult(result);
            }

            // LOT 상태 업데이트
            String newStatus = hasFailure ? "LTST005" : "LTST004"; // 불합격 또는 합격
            qualityInspectionMapper.updateLotStatus(lotNo, newStatus, inspector);

            // 저장된 결과 반환
            return LotInspectionResultDTO.builder()
                .lotNo(lotNo)
                .qcItems(getQcItems(lotNo))
                .finalJudgment(hasFailure ? "N" : "Y")
                .inspector(inspector)
                .inspectionTime(java.time.LocalDateTime.now())
                .build();

        } catch (Exception e) {
            log.error("검사결과 저장 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * LOT 검사상태 조회
     */
    public String getLotInspectionStatus(String lotNo) {
        try {
            log.info("LOT 검사상태 조회 - lotNo: {}", lotNo);
            List<QcItemDTO> items = getQcItems(lotNo);
            
            if (items.isEmpty()) {
                return "NOT_STARTED";
            }
            
            boolean hasIncomplete = items.stream()
                .anyMatch(item -> item.getJudgment() == null);
            if (hasIncomplete) {
                return "IN_PROGRESS";
            }
            
            boolean hasFailed = items.stream()
                .anyMatch(item -> "N".equals(item.getJudgment()));
            
            return hasFailed ? "REJECTED" : "COMPLETED";
            
        } catch (Exception e) {
            log.error("LOT 검사상태 조회 중 오류 발생", e);
            throw e;
        }
    }
}