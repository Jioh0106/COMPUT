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
    
    // Entity -> DTO 변환 메서드들은 이전과 동일하게 유지
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
        return dto;
    }
}