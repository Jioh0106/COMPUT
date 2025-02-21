package com.deepen.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
//    private final LotTrackingMapper lotTrackingMapper;
    
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
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByWorkOrder(wiNo);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }
    
    @GetMapping(value = "/product/{productNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LotMasterDTO>> getLotTrackingByProduct(
            @PathVariable(name = "productNo") Integer productNo) {
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByProduct(productNo);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }
}