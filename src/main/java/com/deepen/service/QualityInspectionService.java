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
        if (lotMaster == null) {
            throw new IllegalArgumentException("LOT 정보를 찾을 수 없습니다: " + lotNo);
        }
        
        return qualityInspectionMapper.selectQcProductMappingByProductAndProcess(
            lotMaster.getProductNo(), 
            lotMaster.getProcessNo()
        );
    }
    
    /**
     * 검사 시작
     */
    @Transactional
    public void startInspection(String lotNo) {
        LotMasterDTO lotMaster = qualityInspectionMapper.selectLotMasterByNo(lotNo);
        if (lotMaster == null) {
            throw new IllegalArgumentException("LOT 정보를 찾을 수 없습니다: " + lotNo);
        }
        
        if (!"LTST003".equals(lotMaster.getLotStatus())) {
            throw new IllegalStateException("검사 대기 상태의 LOT만 검사를 시작할 수 있습니다.");
        }
        
        qualityInspectionMapper.updateLotStatusAndResult(lotNo, "LTST004"); // 검사 진행중
    }
    
    /**
     * 품질검사 결과 저장
     */
    @Transactional
    public void saveInspectionResults(List<QualityInspectionDTO> inspectionResults) {
        if (inspectionResults == null || inspectionResults.isEmpty()) {
            throw new IllegalArgumentException("검사 결과가 없습니다.");
        }

        String originalLotNo = inspectionResults.get(0).getLotNo();
        LotMasterDTO originalLot = qualityInspectionMapper.selectLotMasterByNo(originalLotNo);
        
        if (originalLot == null) {
            throw new IllegalArgumentException("LOT 정보를 찾을 수 없습니다: " + originalLotNo);
        }

        try {
            // 현재 날짜
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            boolean allPassed = true;
            
            for (QualityInspectionDTO result : inspectionResults) {
                try {
                    // 1. 기본 데이터 검증 및 설정
                    validateAndPrepareResult(result, originalLot);
                    
                    // 2. QC_LOG 시퀀스 획득
                    Integer nextQcLogNo = qualityInspectionMapper.getNextQcLogNo();
                    result.setQcLogNo(nextQcLogNo);
                    
                    // 3. 새로운 LOT 번호 생성
                    String newLotNo = generateNewLotNo(currentDate, originalLot.getWiNo(), nextQcLogNo);
                    
                    // 4. 새로운 LOT_MASTER 생성 및 저장
                    LotMasterDTO newLot = createNewLotMaster(originalLot, newLotNo, result);
                    qualityInspectionMapper.insertLotMaster(newLot);
                    
                    // 5. QC_LOG에 검사 결과 저장 (새로운 LOT 번호 사용)
                    result.setLotNo(newLotNo);
                    qualityInspectionMapper.insertQualityInspection(result);
                    
                    if (!"Y".equals(result.getJudgement())) {
                        allPassed = false;
                    }
                    
                    log.info("Created new LOT and QC_LOG: {} with QC_LOG_NO: {}", newLotNo, nextQcLogNo);
                    
                } catch (Exception e) {
                    log.error("Error processing inspection result: {}", result, e);
                    throw e;
                }
            }

            // 6. 원본 LOT 상태 업데이트
            String newStatus = allPassed ? "LTST005" : "LTST006";
            qualityInspectionMapper.updateLotStatusAndResult(originalLotNo, newStatus);

            log.info("Successfully saved inspection results for LOT: {}, Status: {}", 
                     originalLotNo, newStatus);
        } catch (Exception e) {
            log.error("Error while saving inspection results", e);
            throw e;
        }
    }
    
    /**
     * 검사 결과 데이터 검증 및 준비
     */
    private void validateAndPrepareResult(QualityInspectionDTO result, LotMasterDTO lot) {
        // 측정값 필수 체크
        if (result.getMeasureValue() == null) {
            throw new IllegalArgumentException("측정값이 누락되었습니다.");
        }
        
        // ProcessNo 설정
        result.setProcessNo(lot.getProcessNo());
        
        // 시간 정보 처리 (현재 시스템 시간 사용)
        LocalDateTime now = LocalDateTime.now();
        
        // 시작 시간이 없으면 현재 시간으로
        if (result.getCheckTime() == null) {
            result.setCheckTime(now);
        }
        
        // 종료 시간은 무조건 현재 시간으로
        result.setEndTime(now);
        
        log.info("설정된 시간 - CheckTime: {}, EndTime: {}", 
            result.getCheckTime(), result.getEndTime());
        
        // 판정값 체크 및 범위 검사
        if (result.getJudgement() == null) {
            double measureValue = result.getMeasureValue().doubleValue();
            double ucl = result.getUcl() != null ? result.getUcl().doubleValue() : Double.MAX_VALUE;
            double lcl = result.getLcl() != null ? result.getLcl().doubleValue() : Double.MIN_VALUE;
            
            result.setJudgement(measureValue >= lcl && measureValue <= ucl ? "Y" : "N");
        }
    }
    
    /**
     * 새로운 LOT 번호 생성
     */
    private String generateNewLotNo(String currentDate, Integer wiNo, Integer qcLogNo) {
        try {
            // 현재 날짜 기준 순차 번호 조회
            int sequence = qualityInspectionMapper.getNextLotSequence(currentDate);
            
            // LOT 번호 생성: yyyyMMdd-W작업지시번호-Q품질검사이력번호-순차번호
            return String.format("%s-W%d-Q%d-%03d", 
                               currentDate, 
                               wiNo, 
                               qcLogNo, 
                               sequence);
        } catch (Exception e) {
            log.error("Error generating new LOT number", e);
            throw new IllegalArgumentException("LOT 번호 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 새로운 LOT_MASTER 생성
     */
    private LotMasterDTO createNewLotMaster(LotMasterDTO originalLot, String newLotNo, 
                                          QualityInspectionDTO result) {
        LotMasterDTO newLot = new LotMasterDTO();
        newLot.setLotNo(newLotNo);
        newLot.setParentLotNo(originalLot.getLotNo());
        newLot.setProcessType(originalLot.getProcessType());
        newLot.setWiNo(originalLot.getWiNo());
        newLot.setProductNo(originalLot.getProductNo());
        newLot.setProcessNo(originalLot.getProcessNo());
        newLot.setLineNo(originalLot.getLineNo());
        newLot.setLotStatus(result.getJudgement().equals("Y") ? "LTST005" : "LTST006");
        newLot.setStartTime(result.getCheckTime());
        newLot.setEndTime(result.getEndTime());
        
        return newLot;
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
    
    /**
     * 시스템 시간대로 동기화
     */
    private LocalDateTime syncToSystemTimeZone(LocalDateTime inputTime) {
        if (inputTime == null) {
            return LocalDateTime.now();
        }
        return inputTime.atZone(ZoneId.systemDefault()).toLocalDateTime();
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
     * 검사 이력 조회
     */
    public List<InspectionHistoryDTO> getInspectionHistory(InspectionSearchDTO search) {
        log.info("Searching inspection history with criteria: {}", search);
        return qualityInspectionMapper.selectInspectionHistory(search);
    }

    /**
     * 검사 통계 조회
     */
    public InspectionStatsDTO getInspectionStats(String fromDate, String toDate, Integer processNo) {
        log.info("Fetching inspection statistics - date range: {} ~ {}, processNo: {}", 
                 fromDate, toDate, processNo);
                 
        List<InspectionHistoryDTO> inspections = qualityInspectionMapper.selectInspectionHistory(
            createSearchDTO(fromDate, toDate, processNo)
        );

        // 전체 통계 계산
        InspectionStatsDTO stats = new InspectionStatsDTO();
        calculateTotalStats(stats, inspections);
        calculateProcessStats(stats, inspections);

        return stats;
    }
    
    /**
     * 전체 통계 계산
     */
    private void calculateTotalStats(InspectionStatsDTO stats, List<InspectionHistoryDTO> inspections) {
        stats.setTotalCount(inspections.size());
        stats.setPassCount(
            inspections.stream()
                .filter(i -> "Y".equals(i.getJudgement()))
                .count()
        );
        stats.setFailCount(
            inspections.stream()
                .filter(i -> "N".equals(i.getJudgement()))
                .count()
        );

        if (stats.getTotalCount() > 0) {
            stats.setPassRate(
                (double) stats.getPassCount() / stats.getTotalCount() * 100
            );
            stats.setFailRate(
                (double) stats.getFailCount() / stats.getTotalCount() * 100
            );
        }
    }
    
    /**
     * 공정별 통계 계산
     */
    private void calculateProcessStats(InspectionStatsDTO stats, List<InspectionHistoryDTO> inspections) {
        stats.setProcessStats(
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
    }
    
    /**
     * 검색 DTO 생성
     */
    private InspectionSearchDTO createSearchDTO(String fromDate, String toDate, Integer processNo) {
        InspectionSearchDTO search = new InspectionSearchDTO();
        search.setFromDate(fromDate);
        search.setToDate(toDate);
        search.setProcessNo(processNo);
        return search;
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
            // 현재 날짜 기준 순차 번호 조회
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            int sequence = qualityInspectionMapper.getNextLotSequence(currentDate);
            
            // 새로운 LOT 번호 생성
            String newLotNo = String.format("%s-NP%d-%03d", 
                                          currentDate, 
                                          nextProcess.getProcessNo(), 
                                          sequence);
            
            LotMasterDTO newLot = new LotMasterDTO();
            newLot.setLotNo(newLotNo);
            newLot.setParentLotNo(currentLotNo);
            newLot.setProcessType(currentLot.getProcessType());
            newLot.setWiNo(currentLot.getWiNo());
            newLot.setProductNo(currentLot.getProductNo());
            newLot.setProcessNo(nextProcess.getProcessNo());
            newLot.setLotStatus("LTST003"); // 검사 대기 상태
            newLot.setStartTime(LocalDateTime.now());
            
            qualityInspectionMapper.insertLotMaster(newLot);
            
            log.info("Created next process LOT: {} for parent LOT: {}", newLotNo, currentLotNo);
        } else {
            log.info("No next process found for LOT: {}", currentLotNo);
        }
    }
}