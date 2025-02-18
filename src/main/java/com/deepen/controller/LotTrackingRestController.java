package com.deepen.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.LotMasterDTO;
import com.deepen.service.LotTrackingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lot")
@RequiredArgsConstructor
public class LotTrackingRestController {
    private final LotTrackingService lotTrackingService;
    
    @GetMapping("/work-order/{wiNo}")
    public ResponseEntity<List<LotMasterDTO>> getLotTrackingByWorkOrder(
            @PathVariable("wiNo") Integer wiNo) {
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByWorkOrder(wiNo);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/product/{productNo}")
    public ResponseEntity<List<LotMasterDTO>> getLotTrackingByProduct(
            @PathVariable("productNo") Integer productNo) {
        List<LotMasterDTO> result = lotTrackingService.getLotTrackingByProduct(productNo);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{lotNo}")
    public ResponseEntity<LotMasterDTO> getLotTrackingDetail(
            @PathVariable("lotNo") String lotNo) {
        LotMasterDTO result = lotTrackingService.getLotTrackingDetail(lotNo);
        return ResponseEntity.ok(result);
    }
}