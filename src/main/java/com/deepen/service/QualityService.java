package com.deepen.service;

import com.deepen.entity.QcMaster;
import com.deepen.entity.QcProductMapping;
import com.deepen.domain.QcMasterDTO;
import com.deepen.domain.QcProductMappingDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.ProcessInfo;
import com.deepen.entity.Product;
import com.deepen.repository.QcMasterRepository;
import com.deepen.repository.QcProductMappingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.ProcessInfoRepository;
import com.deepen.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class QualityService {
    
    private final QcMasterRepository qcMasterRepository;
    private final QcProductMappingRepository qcProductMappingRepository;
    private final ProcessInfoRepository processInfoRepository;
    private final CommonDetailRepository commonDetailRepository;
    private final ProductRepository productRepository;
    
    // 기준정보 관련 메서드
    public List<QcMasterDTO> getQcList() {
        return qcMasterRepository.findBySearchConditions(null, null)
                                .stream()
                                .map(this::convertToQcDTO)
                                .collect(Collectors.toList());
    }
    
    public List<ProcessInfo> getProcessList() {
        return processInfoRepository.findByIsActive("Y");
    }
    
    public List<Product> getProductList() {
    	return productRepository.findAll();
    }
    
    public List<CommonDetail> getUnitList() {
        return commonDetailRepository.findByCommonCode("UNIT");
    }
    
    // 제품별 품질기준 관련 메서드
    public List<QcProductMappingDTO> getProductQcList(String qcCode) {
        return qcProductMappingRepository.findByQcMaster_QcCode(qcCode)
                                       .stream()
                                       .map(this::convertToProductQcDTO)
                                       .collect(Collectors.toList());
    }
    
    // QC 마스터 저장
    @Transactional
    public QcMasterDTO createQc(QcMasterDTO dto) {
        QcMaster entity = new QcMaster();
        entity.setQcCode(generateQcCode());
        entity.setQcName(dto.getQcName());
        
        ProcessInfo process = processInfoRepository.findById(dto.getProcess())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setQcMethod(dto.getQcMethod());
        
        if (dto.getUnit() != null) {
            CommonDetail unit = commonDetailRepository.findById(dto.getUnit())
                .orElseThrow(() -> new RuntimeException("Unit not found"));
            entity.setUnit(unit);
        }
        
        entity.setUseYn(dto.getUseYn());
        entity.setCreateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    // 제품별 QC 기준 저장
    @Transactional
    public QcProductMappingDTO createProductQc(QcProductMappingDTO dto) {
        QcProductMapping entity = new QcProductMapping();
        
        QcMaster qcMaster = qcMasterRepository.findById(dto.getQcCode())
            .orElseThrow(() -> new RuntimeException("QC not found"));
        entity.setQcMaster(qcMaster);
        
        Product product = productRepository.findById(dto.getProduct_no())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        entity.setProduct(product);
        
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setUseYn("Y");
        entity.setCreateTime(LocalDateTime.now());
        entity.setCreateUser(dto.getCreateUser());
        
        return convertToProductQcDTO(qcProductMappingRepository.save(entity));
    }
    
    @Transactional
    public QcMasterDTO updateQc(QcMasterDTO dto) {
        QcMaster entity = qcMasterRepository.findById(dto.getQcCode())
            .orElseThrow(() -> new RuntimeException("QC not found"));
            
        entity.setQcName(dto.getQcName());
        
        ProcessInfo process = processInfoRepository.findById(dto.getProcess())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setQcMethod(dto.getQcMethod());
        
        if (dto.getUnit() != null) {
            CommonDetail unit = commonDetailRepository.findById(dto.getUnit())
                .orElseThrow(() -> new RuntimeException("Unit not found"));
            entity.setUnit(unit);
        }
        
        entity.setUseYn(dto.getUseYn());
        entity.setUpdateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    @Transactional
    public QcProductMappingDTO updateProductQc(QcProductMappingDTO dto) {
        QcProductMapping entity = qcProductMappingRepository.findById(dto.getMappingId())
            .orElseThrow(() -> new RuntimeException("Product QC mapping not found"));
        
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setUseYn(dto.getUseYn());
        entity.setUpdateTime(LocalDateTime.now());
        entity.setUpdateUser(dto.getUpdateUser());
        
        return convertToProductQcDTO(qcProductMappingRepository.save(entity));
    }
    
    @Transactional
    public void deleteQc(String qcCode) {
        if (!qcMasterRepository.existsById(qcCode)) {
            throw new RuntimeException("삭제할 QC 코드가 존재하지 않습니다: " + qcCode);
        }
        qcMasterRepository.deleteById(qcCode);
    }

    private String generateQcCode() {
        String lastCode = qcMasterRepository.findTopByOrderByQcCodeDesc()
                .map(QcMaster::getQcCode)
                .orElse("QC000");
        
        int sequence = Integer.parseInt(lastCode.replace("QC", "")) + 1;
        return String.format("QC%03d", sequence);
    }
    
    @Transactional
    public void deleteProductQc(Integer mappingId) {
        if (!qcProductMappingRepository.existsById(mappingId)) {
            throw new RuntimeException("삭제할 매핑 ID가 존재하지 않습니다: " + mappingId);
        }
        qcProductMappingRepository.deleteById(mappingId);
    }
    
    // DTO 변환 메서드들
    private QcMasterDTO convertToQcDTO(QcMaster entity) {
        QcMasterDTO dto = new QcMasterDTO();
        dto.setQcCode(entity.getQcCode());
        dto.setQcName(entity.getQcName());
        if(entity.getProcess() != null) {
            dto.setProcess(entity.getProcess().getProcessNo());
        }
        if(entity.getUnit() != null) {
            dto.setUnit(entity.getUnit().getCommon_detail_code());
        }
        dto.setQcMethod(entity.getQcMethod());
        dto.setUseYn(entity.getUseYn());
        dto.setCreateTime(entity.getCreateTime());
        dto.setUpdateTime(entity.getUpdateTime());
        return dto;
    }
    
    private QcProductMappingDTO convertToProductQcDTO(QcProductMapping entity) {
        QcProductMappingDTO dto = new QcProductMappingDTO();
        dto.setMappingId(entity.getMappingId());
        dto.setQcCode(entity.getQcMaster().getQcCode());
        dto.setQcName(entity.getQcMaster().getQcName());
        dto.setProduct_no(entity.getProduct().getProduct_no());
        dto.setProduct_name(entity.getProduct().getProduct_name());
        dto.setTargetValue(entity.getTargetValue());
        dto.setUcl(entity.getUcl());
        dto.setLcl(entity.getLcl());
        dto.setUseYn(entity.getUseYn());
        dto.setCreateTime(entity.getCreateTime());
        dto.setCreateUser(entity.getCreateUser());
        dto.setUpdateTime(entity.getUpdateTime());
        dto.setUpdateUser(entity.getUpdateUser());
        return dto;
    }
}