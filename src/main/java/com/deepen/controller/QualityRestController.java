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

import com.deepen.domain.QcMasterDTO;
import com.deepen.domain.QcProductMappingDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.ProcessInfo;
import com.deepen.entity.Product;
import com.deepen.service.QualityService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/quality")
@RequiredArgsConstructor
@Slf4j
public class QualityRestController {
    
    private final QualityService qualityService;
    
    // QC 기준정보 목록 조회
    @GetMapping("/qc/list")
    public ResponseEntity<List<QcMasterDTO>> getQcList() {
        return ResponseEntity.ok(qualityService.getQcList());
    }
    
    // 공정 목록 조회
    @GetMapping("/common/process")
    public ResponseEntity<List<ProcessInfo>> getProcessList() {
        return ResponseEntity.ok(qualityService.getProcessList());
    }
    
    // 단위 목록 조회
    @GetMapping("/common/unit")
    public ResponseEntity<List<CommonDetail>> getUnitList() {
        return ResponseEntity.ok(qualityService.getUnitList());
    }
    
    // 제품별 QC 기준 조회
    @GetMapping("/qc/{qcCode}/products")
    public ResponseEntity<List<QcProductMappingDTO>> getProductQcList(@PathVariable("qcCode") String qcCode) {
        return ResponseEntity.ok(qualityService.getProductQcList(qcCode));
    }
    
    // QC 기준정보 등록
    @PostMapping("/qc")
    public ResponseEntity<QcMasterDTO> createQc(@RequestBody QcMasterDTO qcMasterDTO) {
        return ResponseEntity.ok(qualityService.createQc(qcMasterDTO));
    }
    
    // 제품별 QC 기준 등록
    @PostMapping("/qc/product")
    public ResponseEntity<QcProductMappingDTO> createProductQc(@RequestBody QcProductMappingDTO productQcDTO) {
        return ResponseEntity.ok(qualityService.createProductQc(productQcDTO));
    }
    
    // QC 기준정보 수정
    @PutMapping("/qc/update")
    public ResponseEntity<QcMasterDTO> updateQc(@RequestBody QcMasterDTO qcMasterDTO) {
        return ResponseEntity.ok(qualityService.updateQc(qcMasterDTO));
    }
    
    // 제품별 QC 기준 수정
    @PutMapping("/qc/product/update")
    public ResponseEntity<QcProductMappingDTO> updateProductQc(@RequestBody QcProductMappingDTO productQcDTO) {
        return ResponseEntity.ok(qualityService.updateProductQc(productQcDTO));
    }
    
    // QC 기준정보 삭제
    @DeleteMapping("/qc/{qcCode}")
    public ResponseEntity<Void> deleteQc(@PathVariable(name = "qcCode") String qcCode) {
        qualityService.deleteQc(qcCode);
        return ResponseEntity.ok().build();
    }
    
    // 제품별 QC 기준 삭제
    @DeleteMapping("/qc/product/{mappingId}")
    public ResponseEntity<Void> deleteProductQc(@PathVariable(name = "mappingId") Integer mappingId) {
        qualityService.deleteProductQc(mappingId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/product/list")
    public List<Product> getProductList() {
        return qualityService.getProductList();
    }
}