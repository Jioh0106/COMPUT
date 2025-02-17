package com.deepen.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepen.domain.InspectionHistoryDTO;
import com.deepen.domain.InspectionSearchDTO;
import com.deepen.domain.InspectionStatsDTO;
import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.domain.ProcessStatsDTO;
import com.deepen.domain.QcProductMappingDTO;
import com.deepen.domain.QualityInspectionDTO;
import com.deepen.mapper.QualityInspectionMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QualityInspectionService {

    private final QualityInspectionMapper qualityInspectionMapper;
    
    /**
     * 검사 대상 LOT 목록 조회
     */
    public List<LotMasterDTO> getInspectionLots(String lotNo, Integer wiNo, Integer processNo) {
        log.debug("Fetching inspection lots with filters - lotNo: {}, wiNo: {}, processNo: {}", 
                  lotNo, wiNo, processNo);
        return qualityInspectionMapper.selectInspectionLots(lotNo, wiNo, processNo);
    }
    
    /**
     * LOT별 검사 항목 조회
     */
    public List<QcProductMappingDTO> getInspectionItemsByLotNo(String lotNo) {
        LotMasterDTO lotMaster = qualityInspectionMapper.selectLotMasterByNo(lotNo);
        
        return qualityInspectionMapper.selectQcProductMappingByProductAndProcess(
            lotMaster.getProductNo(), 
            lotMaster.getProcessNo()
        );
    }
    
    /**
     * 품질검사 결과 저장
     */
    @Transactional
    public void saveInspectionResults(List<QualityInspectionDTO> inspectionResults) {
        if (inspectionResults == null || inspectionResults.isEmpty()) {
            throw new IllegalArgumentException("검사 결과가 없습니다.");
        }

        String lotNo = inspectionResults.get(0).getLotNo();
        LotMasterDTO lotMaster = qualityInspectionMapper.selectLotMasterByNo(lotNo);
        
        if (lotMaster == null) {
            throw new IllegalArgumentException("LOT 정보를 찾을 수 없습니다: " + lotNo);
        }

        try {
            // 검사 결과 저장
            for (QualityInspectionDTO result : inspectionResults) {
                if (result.getMeasureValue() == null) {
                    throw new IllegalArgumentException("측정값이 누락되었습니다.");
                }
                
                // ProcessNo 설정
                result.setProcessNo(lotMaster.getProcessNo());
                
                // 시간 변환 및 로깅
                LocalDateTime checkTime = convertToLocalDateTime(result.getCheckTime());
                LocalDateTime endTime = convertToLocalDateTime(result.getEndTime());
                
                checkTime = syncToSystemTimeZone(checkTime);
                endTime = syncToSystemTimeZone(endTime);
                
                log.info("원본 시간 - CheckTime: {}, EndTime: {}", 
                    result.getCheckTime(), result.getEndTime());
                
                log.info("변환된 시간 - CheckTime: {}, EndTime: {}", 
                    checkTime, endTime);
                
                result.setCheckTime(checkTime);
                result.setEndTime(endTime);
                
                // 판정값 체크 및 범위 검사 (이 부분 추가)
                if (result.getJudgement() == null) {
                    double measureValue = result.getMeasureValue().doubleValue();
                    double ucl = result.getUcl() != null ? result.getUcl().doubleValue() : Double.MAX_VALUE;
                    double lcl = result.getLcl() != null ? result.getLcl().doubleValue() : Double.MIN_VALUE;
                    
                    result.setJudgement(measureValue >= lcl && measureValue <= ucl ? "Y" : "N");
                }

                result.setQcLogNo(null);
                qualityInspectionMapper.insertQualityInspection(result);
            }

            // 모든 검사가 합격인지 확인
            boolean allPassed = inspectionResults.stream()
                .allMatch(result -> "Y".equals(result.getJudgement()));

            // LOT 상태 업데이트
            String newStatus = allPassed ? "LTST005" : "LTST006";  // 검사완료 or 불합격
            qualityInspectionMapper.updateLotStatusAndResult(lotNo, newStatus);

            log.info("Successfully saved inspection results for LOT: {}, Status: {}", lotNo, newStatus);
        } catch (Exception e) {
            log.error("Error while saving inspection results", e);
            throw e;
        }
    }
    
    /**
     * 문자열 또는 날짜 형식의 시간을 LocalDateTime으로 변환
     */
    private LocalDateTime convertToLocalDateTime(Object inputTime) {
        if (inputTime == null) {
            return LocalDateTime.now();
        }
        
        try {
            if (inputTime instanceof LocalDateTime) {
                return (LocalDateTime) inputTime;
            }
            
            if (inputTime instanceof String) {
                String inputTimeStr = (String) inputTime;
                return LocalDateTime.parse(inputTimeStr, DateTimeFormatter.ISO_DATE_TIME);
            }
            
            log.warn("지원되지 않는 시간 형식: {}", inputTime.getClass());
            return LocalDateTime.now();
        } catch (Exception e) {
            log.error("시간 변환 중 오류 발생: {}", inputTime, e);
            return LocalDateTime.now();
        }
    }
    
    private LocalDateTime syncToSystemTimeZone(LocalDateTime inputTime) {
        if (inputTime == null) {
            return LocalDateTime.now();
        }
        
        // 시스템 기본 시간대로 변환
        return inputTime.atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
    
    /**
     * 다음 공정 LOT 생성
     */
    @Transactional
    public void createNextProcessLot(String currentLotNo, String judgement) {
        // 합격인 경우에만 다음 공정 LOT 생성
        if (!"Y".equals(judgement)) {
            log.info("Skip creating next process LOT - judgement is not passed: {}", judgement);
            return;
        }

        LotMasterDTO currentLot = qualityInspectionMapper.selectLotMasterByNo(currentLotNo);
        ProcessInfoDTO nextProcess = qualityInspectionMapper.selectNextProcess(currentLot.getProcessNo());
        
        if (nextProcess != null) {
            String newLotNo = generateNewLotNo(nextProcess.getProcessNo());
            
            LotMasterDTO newLot = new LotMasterDTO();
            newLot.setLotNo(newLotNo);
            newLot.setParentLotNo(currentLotNo);
            newLot.setProcessType(currentLot.getProcessType());
            newLot.setWiNo(currentLot.getWiNo());
            newLot.setProductNo(currentLot.getProductNo());
            newLot.setProcessNo(nextProcess.getProcessNo());
            newLot.setLotStatus("LTST003"); // 검사 대기 상태
            
            qualityInspectionMapper.insertLotMaster(newLot);
            qualityInspectionMapper.insertLotRelationship(currentLotNo, newLotNo);
            
            log.info("Created next process LOT: {} for parent LOT: {}", newLotNo, currentLotNo);
        } else {
            log.info("No next process found for LOT: {}", currentLotNo);
        }
    }
    
    /**
     * LOT 상태 업데이트
     */
    @Transactional
    public void updateLotStatusAndResult(String lotNo, String lotStatus) {
        qualityInspectionMapper.updateLotStatusAndResult(lotNo, lotStatus);
        log.info("Updated LOT status: {} to {}", lotNo, lotStatus);
    }
    
    /**
     * 품질검사 이력 조회
     */
    public List<QualityInspectionDTO> getQualityInspectionHistory(String lotNo) {
        return qualityInspectionMapper.selectQualityInspectionByLotNo(lotNo);
    }
    
    /**
     * 전체 공정 정보 조회
     */
    public List<ProcessInfoDTO> getAllProcessInfo() {
        return qualityInspectionMapper.selectAllProcessInfo();
    }
    
    /**
     * 새로운 LOT 번호 생성
     */
    private String generateNewLotNo(Integer processNo) {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("L%s%03d", dateStr, processNo);
    }

    /**
     * 검사 이력 조회
     */
    public List<InspectionHistoryDTO> getInspectionHistory(InspectionSearchDTO search) {
        log.info("Searching inspection history with criteria: {}", search);
        return qualityInspectionMapper.selectInspectionHistory(search);
    }

    /**
     * 검사 통계 조회
     */
    public InspectionStatsDTO getInspectionStats(
        String fromDate, 
        String toDate, 
        Integer processNo
    ) {
        log.info("Fetching inspection statistics - date range: {} ~ {}, processNo: {}", 
                 fromDate, toDate, processNo);
                 
        List<InspectionHistoryDTO> inspections = qualityInspectionMapper.selectInspectionHistory(
            createSearchDTO(fromDate, toDate, processNo)
        );

        // 전체 통계 계산
        InspectionStatsDTO totalStats = new InspectionStatsDTO();
        
        // 전체 합계 계산
        totalStats.setTotalCount(inspections.size());
        totalStats.setPassCount(
            inspections.stream()
                .filter(i -> "Y".equals(i.getJudgement()))
                .count()
        );
        totalStats.setFailCount(
            inspections.stream()
                .filter(i -> "N".equals(i.getJudgement()))
                .count()
        );

        // 전체 비율 계산
        if (totalStats.getTotalCount() > 0) {
            totalStats.setPassRate(
                (double) totalStats.getPassCount() / totalStats.getTotalCount() * 100
            );
            totalStats.setFailRate(
                (double) totalStats.getFailCount() / totalStats.getTotalCount() * 100
            );
        }

        // 공정별 통계 계산
        totalStats.setProcessStats(
            inspections.stream()
                .collect(Collectors.groupingBy(InspectionHistoryDTO::getProcessNo))
                .entrySet().stream()
                .map(entry -> {
                    ProcessStatsDTO processStats = new ProcessStatsDTO();
                    List<InspectionHistoryDTO> processInspections = entry.getValue();
                    
                    processStats.setProcessNo(entry.getKey());
                    processStats.setProcessName(processInspections.get(0).getProcessName());
                    processStats.setTotalCount(processInspections.size());
                    processStats.setPassCount(
                        processInspections.stream()
                            .filter(i -> "Y".equals(i.getJudgement()))
                            .count()
                    );
                    processStats.setFailCount(
                        processInspections.stream()
                            .filter(i -> "N".equals(i.getJudgement()))
                            .count()
                    );
                    
                    if (processStats.getTotalCount() > 0) {
                        processStats.setPassRate(
                            (double) processStats.getPassCount() / processStats.getTotalCount() * 100
                        );
                        processStats.setFailRate(
                            (double) processStats.getFailCount() / processStats.getTotalCount() * 100
                        );
                    }
                    
                    return processStats;
                })
                .collect(Collectors.toList())
        );

        return totalStats;
    }
    
    private InspectionSearchDTO createSearchDTO(String fromDate, String toDate, Integer processNo) {
        InspectionSearchDTO search = new InspectionSearchDTO();
        search.setFromDate(fromDate);
        search.setToDate(toDate);
        search.setProcessNo(processNo);
        return search;
    }
}