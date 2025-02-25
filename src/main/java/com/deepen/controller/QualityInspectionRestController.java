package com.deepen.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.QualityInspectionDTO;
import com.deepen.domain.InspectionHistoryDTO;
import com.deepen.domain.InspectionSearchDTO;
import com.deepen.domain.InspectionStatsDTO;
import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.domain.QcProductMappingDTO;
import com.deepen.service.QualityInspectionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/quality")
@RequiredArgsConstructor
public class QualityInspectionRestController {
    
    private final QualityInspectionService qualityInspectionService;
    
    // 검사 대상 LOT 조회
    @GetMapping("/lots")
    public ResponseEntity<List<LotMasterDTO>> getInspectionLots(
        @RequestParam(value = "lotNo", required = false) String lotNo,
        @RequestParam(value = "wiNo", required = false) Integer wiNo,
        @RequestParam(value = "processNo", required = false) Integer processNo
    ) {
        return ResponseEntity.ok(
            qualityInspectionService.getInspectionLots(lotNo, wiNo, processNo)
        );
    }
    
    // 특정 LOT의 검사 항목 조회
    @GetMapping("/items/{lotNo}")
    public ResponseEntity<List<QcProductMappingDTO>> getInspectionItems(
        @PathVariable(value = "lotNo") String lotNo
    ) {
        return ResponseEntity.ok(qualityInspectionService.getInspectionItemsByLotNo(lotNo));
    }
    
    // 품질검사 결과 저장
    @PostMapping("/result")
    public ResponseEntity<Void> saveInspectionResult(
        @RequestBody List<QualityInspectionDTO> inspectionResults
    ) {
        qualityInspectionService.saveInspectionResults(inspectionResults);
        return ResponseEntity.ok().build();
    }
    
    // 특정 LOT의 검사 결과 조회
    @GetMapping("/result/{lotNo}")
    public ResponseEntity<List<QualityInspectionDTO>> getInspectionResult(
        @PathVariable(name = "lotNo") String lotNo
    ) {
        log.info("Fetching inspection results for lotNo: {}", lotNo);
        List<QualityInspectionDTO> results = qualityInspectionService.getQualityInspectionHistory(lotNo);
        return ResponseEntity.ok(results != null ? results : Collections.emptyList());
    }
    
    @PostMapping("/lot/status")
    public ResponseEntity<Void> updateLotStatus(
       @RequestBody Map<String, String> request
    ) {
       qualityInspectionService.updateLotStatusAndResult(
           request.get("lotNo"), 
           request.get("lotStatus")
       );
       return ResponseEntity.ok().build();
    }
    
//    @PostMapping("/next-process")
//    public ResponseEntity<Void> createNextProcessLot(
//        @RequestBody Map<String, String> request
//    ) {
//        String lotNo = request.get("lotNo");
//        String judgement = request.get("judgement");
//        
//        if (lotNo == null || judgement == null) {
//            return ResponseEntity.badRequest().build();
//        }
//        
//        qualityInspectionService.createNextProcessLot(lotNo, judgement);
//        return ResponseEntity.ok().build();
//    }
    
    /**
     * 공정 목록 조회
     */
    @GetMapping("/process-list")
    public ResponseEntity<List<ProcessInfoDTO>> getProcessList() {
        return ResponseEntity.ok(
            qualityInspectionService.getAllProcessInfo()
        );
    }
    
    /**
     * 검사 이력 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<InspectionHistoryDTO>> getInspectionHistory(
        @RequestParam(value = "lotNo", required = false) String lotNo,
        @RequestParam(value = "fromDate", required = false) String fromDate,
        @RequestParam(value = "toDate", required = false) String toDate,
        @RequestParam(value = "processNo", required = false) Integer processNo,
        @RequestParam(value = "judgement", required = false) String judgement
    ) {
        log.info("lotNo: {}, date range: {} ~ {}, processNo: {}, judgement: {}", 
                 lotNo, fromDate, toDate, processNo, judgement);

        InspectionSearchDTO search = new InspectionSearchDTO();
        search.setLotNo(lotNo);
        search.setFromDate(fromDate);
        search.setToDate(toDate);
        search.setProcessNo(processNo);
        search.setJudgement(judgement);

        return ResponseEntity.ok(qualityInspectionService.getInspectionHistory(search));
    }

    /**
     * 검사 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<InspectionStatsDTO> getInspectionStats(
        @RequestParam(value = "fromDate", required = false) String fromDate,
        @RequestParam(value = "toDate", required = false) String toDate,
        @RequestParam(value = "processNo", required = false) Integer processNo
    ) {
        log.info("Fetching inspection statistics - date range: {} ~ {}, processNo: {}", 
                 fromDate, toDate, processNo);

        return ResponseEntity.ok(
            qualityInspectionService.getInspectionStats(fromDate, toDate, processNo)
        );
    }
}