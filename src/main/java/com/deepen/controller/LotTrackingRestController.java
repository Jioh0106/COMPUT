package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.LotMasterDTO;
//import com.deepen.mapper.LotTrackingMapper;
import com.deepen.service.LotTrackingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/lot")
@RequiredArgsConstructor
public class LotTrackingRestController {
    private final LotTrackingService lotTrackingService;
    
    @GetMapping(value = "/{lotNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LotMasterDTO> getLotTrackingDetail(
            @PathVariable(name = "lotNo") String lotNo) {
        try {
            log.info("Received request to get LOT detail for: {}", lotNo);
            
            LotMasterDTO result = lotTrackingService.getLotTrackingDetail(lotNo);
            if (result == null) {
                log.warn("LOT not found: {}", lotNo);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Successfully retrieved LOT detail");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);
                    
        } catch (Exception e) {
            log.error("Error getting LOT detail for: " + lotNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/work-order/{wiNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LotMasterDTO>> getLotTrackingByWorkOrder(
            @PathVariable(name = "wiNo") Integer wiNo) {

        long start = System.currentTimeMillis();

        // (1) LOT 목록 1회, (2) 공정 이력 일괄 조회, (3) QC 이력 일괄 조회 → 3번 쿼리
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByWorkOrder(wiNo);

        long end = System.currentTimeMillis();
        System.out.println("[LOG] getLotTrackingByWorkOrder took " 
                           + (end - start) + " ms");

        return ResponseEntity.ok(result);
    }

    
    @GetMapping(value = "/product/{productNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LotMasterDTO>> getLotTrackingByProduct(
            @PathVariable(name = "productNo") Integer productNo) {
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByProduct(productNo);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }
    
    @GetMapping(value = "/hierarchy/work-order/{wiNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getLotHierarchyByWorkOrder(
            @PathVariable(name = "wiNo") Integer wiNo) {
        try {
            log.info("Received request to get LOT hierarchy for work order: {}", wiNo);
            
            Map<String, Object> result = lotTrackingService.getLotHierarchyByWorkOrder(wiNo);
            if (result == null) {
                log.warn("Work order not found: {}", wiNo);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Successfully retrieved LOT hierarchy for work order");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);
                    
        } catch (Exception e) {
            log.error("Error getting LOT hierarchy for work order: " + wiNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> searchLots(
            @RequestParam(name = "lotNo", required = false) String lotNo,
            @RequestParam(name = "productNo", required = false) Integer productNo,
            @RequestParam(name = "processType", required = false) String processType,
            @RequestParam(name = "searchText", required = false) String searchText,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Map<String, Object> result = lotTrackingService.searchLots(lotNo, productNo, processType, searchText, page, size);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(result);
    }
}