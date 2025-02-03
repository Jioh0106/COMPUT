package com.deepen.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.DefectMasterDTO;
import com.deepen.domain.QcMasterDTO;
import com.deepen.service.QualityService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/quality")
@RequiredArgsConstructor
@Slf4j
public class QualityRestController {
	
	private final QualityService qualityService;
	
	@GetMapping("/qc/list")
    public ResponseEntity<List<QcMasterDTO>> getQcList() {
        return ResponseEntity.ok(qualityService.getQcList());
    }
    
    @GetMapping("/defect/list")
    public ResponseEntity<List<DefectMasterDTO>> getDefectList() {
        return ResponseEntity.ok(qualityService.getDefectList());
    }
    
    @PostMapping("/qc")
    public ResponseEntity<QcMasterDTO> createQc(@RequestBody QcMasterDTO qcMasterDTO) {
        return ResponseEntity.ok(qualityService.createQc(qcMasterDTO));
    }

    @PostMapping("/defect")
    public ResponseEntity<DefectMasterDTO> createDefect(@RequestBody DefectMasterDTO defectMasterDTO) {
        return ResponseEntity.ok(qualityService.createDefect(defectMasterDTO));
    }
    
    @PutMapping("/qc/update")
    public ResponseEntity<QcMasterDTO> updateQc(@RequestBody QcMasterDTO qcMasterDTO) {
        return ResponseEntity.ok(qualityService.updateQc(qcMasterDTO));
    }

    @PutMapping("/defect/update")
    public ResponseEntity<DefectMasterDTO> updateDefect(@RequestBody DefectMasterDTO defectMasterDTO) {
        return ResponseEntity.ok(qualityService.updateDefect(defectMasterDTO));
    }
}
