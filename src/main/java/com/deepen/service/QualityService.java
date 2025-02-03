package com.deepen.service;

import com.deepen.entity.QcMaster;
import com.deepen.domain.DefectMasterDTO;
import com.deepen.domain.QcMasterDTO;
import com.deepen.entity.DefectMaster;
import com.deepen.repository.QcMasterRepository;

import lombok.RequiredArgsConstructor;

import com.deepen.repository.DefectMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class QualityService {
    
    private final QcMasterRepository qcMasterRepository;
    private final DefectMasterRepository defectMasterRepository;
    
    public List<QcMasterDTO> getQcList() {
        return qcMasterRepository.findBySearchConditions(null, null, "Y")
                                .stream()
                                .map(this::convertToQcDTO)
                                .collect(Collectors.toList());
    }
    
    public List<DefectMasterDTO> getDefectList() {
        return defectMasterRepository.findBySearchConditions(null, null, "Y")
                                   .stream()
                                   .map(this::convertToDefectDTO)
                                   .collect(Collectors.toList());
    }
    
    private QcMasterDTO convertToQcDTO(QcMaster entity) {
        QcMasterDTO dto = new QcMasterDTO();
        dto.setQcCode(entity.getQcCode());
        dto.setQcName(entity.getQcName());
        dto.setProcessNo(entity.getProcessNo());
        dto.setProductNo(entity.getProductNo());
        dto.setTargetValue(entity.getTargetValue());
        dto.setUcl(entity.getUcl());
        dto.setLcl(entity.getLcl());
        dto.setUnit(entity.getUnit());
        dto.setQcMethod(entity.getQcMethod());
        dto.setUseYn(entity.getUseYn());
        dto.setCreateUser(entity.getCreateUser());
        dto.setCreateTime(entity.getCreateTime());
        dto.setUpdateUser(entity.getUpdateUser());
        dto.setUpdateTime(entity.getUpdateTime());
        return dto;
    }
    
    private DefectMasterDTO convertToDefectDTO(DefectMaster entity) {
        DefectMasterDTO dto = new DefectMasterDTO();
        dto.setDefectCode(entity.getDefectCode());
        dto.setDefectName(entity.getDefectName());
        dto.setProcessNo(entity.getProcessNo());
        dto.setDefectType(entity.getDefectType());
        dto.setDefectLevel(entity.getDefectLevel());
        dto.setJudgmentCriteria(entity.getJudgmentCriteria());
        dto.setUseYn(entity.getUseYn());
        dto.setCreateUser(entity.getCreateUser());
        dto.setCreateTime(entity.getCreateTime());
        dto.setUpdateUser(entity.getUpdateUser());
        dto.setUpdateTime(entity.getUpdateTime());
        return dto;
    }
    
    @Transactional
    public QcMasterDTO createQc(QcMasterDTO dto) {
        QcMaster entity = new QcMaster();
        entity.setQcCode(generateQcCode());
        entity.setQcName(dto.getQcName());
        entity.setProcessNo(dto.getProcessNo());
        entity.setProductNo(dto.getProductNo());
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setUnit(dto.getUnit());
        entity.setQcMethod(dto.getQcMethod());
        entity.setUseYn("Y");
        entity.setCreateUser(dto.getCreateUser());
        entity.setCreateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    @Transactional
    public DefectMasterDTO createDefect(DefectMasterDTO dto) {
        DefectMaster entity = new DefectMaster();
        entity.setDefectCode(generateDefectCode());
        entity.setDefectName(dto.getDefectName());
        entity.setProcessNo(dto.getProcessNo());
        entity.setDefectType(dto.getDefectType());
        entity.setDefectLevel(dto.getDefectLevel());
        entity.setJudgmentCriteria(dto.getJudgmentCriteria());
        entity.setUseYn("Y");
        entity.setCreateUser(dto.getCreateUser());
        entity.setCreateTime(LocalDateTime.now());
        
        return convertToDefectDTO(defectMasterRepository.save(entity));
    }

    private String generateQcCode() {
        String lastCode = qcMasterRepository.findTopByOrderByQcCodeDesc()
                .map(QcMaster::getQcCode)
                .orElse("QC000");
        
        int sequence = Integer.parseInt(lastCode.substring(2)) + 1;
        return String.format("QC%03d", sequence);
    }

    private String generateDefectCode() {
        String lastCode = defectMasterRepository.findTopByOrderByDefectCodeDesc()
                .map(DefectMaster::getDefectCode)
                .orElse("DF000");
        
        int sequence = Integer.parseInt(lastCode.substring(2)) + 1;
        return String.format("DF%03d", sequence);
    }
    
    @Transactional
    public QcMasterDTO updateQc(QcMasterDTO dto) {
        QcMaster entity = qcMasterRepository.findById(dto.getQcCode())
            .orElseThrow(() -> new RuntimeException("QC not found"));
            
        entity.setQcName(dto.getQcName());
        entity.setProcessNo(dto.getProcessNo());
        entity.setProductNo(dto.getProductNo());
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setUnit(dto.getUnit());
        entity.setQcMethod(dto.getQcMethod());
        entity.setUpdateUser(dto.getUpdateUser());
        entity.setUpdateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    @Transactional
    public DefectMasterDTO updateDefect(DefectMasterDTO dto) {
        DefectMaster entity = defectMasterRepository.findById(dto.getDefectCode())
            .orElseThrow(() -> new RuntimeException("Defect not found"));
            
        entity.setDefectName(dto.getDefectName());
        entity.setProcessNo(dto.getProcessNo());
        entity.setDefectType(dto.getDefectType());
        entity.setDefectLevel(dto.getDefectLevel());
        entity.setJudgmentCriteria(dto.getJudgmentCriteria());
        entity.setUpdateUser(dto.getUpdateUser());
        entity.setUpdateTime(LocalDateTime.now());
        
        return convertToDefectDTO(defectMasterRepository.save(entity));
    }
}