package com.deepen.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.DefectMasterDTO;
import com.deepen.domain.QcMasterDTO;
import com.deepen.domain.QualityCheckDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.ProcessInfo;
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
    
    @GetMapping("/common/process")
    public ResponseEntity<List<ProcessInfo>> getProcessList() {
        return ResponseEntity.ok(qualityService.getProcessList());
    }
    
    @GetMapping("/common/unit")
    public ResponseEntity<List<CommonDetail>> getUnitList() {
        return ResponseEntity.ok(qualityService.getUnitList());
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
    
    @DeleteMapping("/qc/{qcCode}")
    public ResponseEntity<Void> deleteQc(@PathVariable(name = "qcCode") String qcCode) {
        qualityService.deleteQc(qcCode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/defect/{defectCode}")
    public ResponseEntity<Void> deleteDefect(@PathVariable(name = "defectCode") String defectCode) {
        qualityService.deleteDefect(defectCode);
        return ResponseEntity.ok().build();
    }
    
    // 품질검사 대기 목록 조회
    @GetMapping("/check/wait-list")
    public ResponseEntity<List<QualityCheckDTO>> getWaitList() {
        return ResponseEntity.ok(qualityService.getQualityCheckWaitList());
    }
    
    // 품질검사 시작
    @PostMapping("/check/start")
    public ResponseEntity<Void> startQualityCheck(@RequestBody QualityCheckDTO dto) {
        qualityService.startQualityCheck(dto);
        return ResponseEntity.ok().build();
    }

    // 품질검사 결과 저장
    @PostMapping("/check/complete")
    public ResponseEntity<Void> completeQualityCheck(@RequestBody QualityCheckDTO dto) {
        qualityService.completeQualityCheck(dto);
        return ResponseEntity.ok().build();
    }
}