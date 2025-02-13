package com.deepen.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.QualityInspectionDTO.InspectionResultDTO;
import com.deepen.domain.QualityInspectionDTO.LotInspectionDTO;
import com.deepen.domain.QualityInspectionDTO.LotInspectionResultDTO;
import com.deepen.domain.QualityInspectionDTO.QcItemDTO;
import com.deepen.service.QualityInspectionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/quality/inspection")
@RequiredArgsConstructor
public class QualityInspectionRestController {
    
    private final QualityInspectionService qualityInspectionService;

    /**
     * 검사대상 LOT 목록 조회
     */
    @GetMapping("/lots")
    public ResponseEntity<List<LotInspectionDTO>> getInspectionLots(
            @RequestParam(required = false) String lotNo,
            @RequestParam(required = false) String wiNo,
            @RequestParam(required = false) Long processNo) {
        
        try {
            List<LotInspectionDTO> lots = qualityInspectionService.getInspectionLots(lotNo, wiNo, processNo);
            return ResponseEntity.ok(lots);
        } catch (Exception e) {
            log.error("검사대상 LOT 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LOT별 검사항목 조회
     */
    @GetMapping("/items/{lotNo}")
    public ResponseEntity<List<QcItemDTO>> getQcItems(@PathVariable String lotNo) {
        try {
            List<QcItemDTO> items = qualityInspectionService.getQcItems(lotNo);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            log.error("LOT 검사항목 조회 중 오류 발생 - lotNo: {}", lotNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 검사결과 저장
     */
    @PostMapping("/result")
    public ResponseEntity<LotInspectionResultDTO> saveInspectionResult(
            @RequestBody List<InspectionResultDTO> results) {
        try {
            LotInspectionResultDTO savedResult = qualityInspectionService.saveInspectionResults(results);
            return ResponseEntity.ok(savedResult);
        } catch (IllegalArgumentException e) {
            log.error("검사결과 저장 중 유효성 검사 오류", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("검사결과 저장 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LOT 검사상태 조회
     */
    @GetMapping("/status/{lotNo}")
    public ResponseEntity<String> getLotInspectionStatus(@PathVariable String lotNo) {
        try {
            String status = qualityInspectionService.getLotInspectionStatus(lotNo);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("LOT 검사상태 조회 중 오류 발생 - lotNo: {}", lotNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}