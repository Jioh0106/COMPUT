package com.deepen.service;

import com.deepen.entity.QcMaster;
import com.deepen.domain.DefectMasterDTO;
import com.deepen.domain.QcMasterDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.DefectMaster;
import com.deepen.entity.ProcessInfo;
import com.deepen.repository.QcMasterRepository;

import lombok.RequiredArgsConstructor;

import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.DefectMasterRepository;
import com.deepen.repository.ProcessInfoRepository;

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
    private final ProcessInfoRepository processInfoRepository;
    private final CommonDetailRepository commonDetailRepository;
    
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

    // Process 목록 조회
    public List<ProcessInfo> getProcessList() {
        return processInfoRepository.findByIsActive("Y");
    }
    
    // 단위 목록 조회
    public List<CommonDetail> getUnitList() {
        return commonDetailRepository.findByCommonCode("UNIT");
    }
    
    private QcMasterDTO convertToQcDTO(QcMaster entity) {
        QcMasterDTO dto = new QcMasterDTO();
        dto.setQcCode(entity.getQcCode());
        dto.setQcName(entity.getQcName());
        
        // Process 정보
        if(entity.getProcess() != null) {
            dto.setProcessNo(entity.getProcess().getProcessNo());
            dto.setProcessName(entity.getProcess().getProcessName());
        }
        
        dto.setTargetValue(entity.getTargetValue());
        dto.setUcl(entity.getUcl());
        dto.setLcl(entity.getLcl());
        dto.setQcMethod(entity.getQcMethod());
        
        // Unit 정보
        if(entity.getUnit() != null) {
            dto.setUnitCode(entity.getUnit().getCommon_detail_code());
            dto.setUnitName(entity.getUnit().getCommon_detail_name());
        }
        
        dto.setUseYn(entity.getUseYn());
        dto.setCreateTime(entity.getCreateTime());
        dto.setUpdateTime(entity.getUpdateTime());
        
        return dto;
    }
    
    private DefectMasterDTO convertToDefectDTO(DefectMaster entity) {
        DefectMasterDTO dto = new DefectMasterDTO();
        dto.setDefectCode(entity.getDefectCode());
        dto.setDefectName(entity.getDefectName());
        
        // Process 정보
        if(entity.getProcess() != null) {
            dto.setProcessNo(entity.getProcess().getProcessNo());
            dto.setProcessName(entity.getProcess().getProcessName());
        }
        
        dto.setDefectType(entity.getDefectType());
        dto.setDefectLevel(entity.getDefectLevel());
        dto.setJudgmentCriteria(entity.getJudgmentCriteria());
        dto.setUseYn(entity.getUseYn());
        dto.setCreateTime(entity.getCreateTime());
        dto.setUpdateTime(entity.getUpdateTime());
        
        return dto;
    }
    
    @Transactional
    public QcMasterDTO createQc(QcMasterDTO dto) {
        QcMaster entity = new QcMaster();
        entity.setQcCode(generateQcCode());
        entity.setQcName(dto.getQcName());
        
        // Process 설정
        ProcessInfo process = processInfoRepository.findById(dto.getProcessNo())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setQcMethod(dto.getQcMethod());
        
        // Unit 설정
        CommonDetail unit = commonDetailRepository.findById(dto.getUnitCode())
            .orElseThrow(() -> new RuntimeException("Unit not found"));
        entity.setUnit(unit);
        
        entity.setUseYn(dto.getUseYn());
        entity.setCreateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    @Transactional
    public DefectMasterDTO createDefect(DefectMasterDTO dto) {
        DefectMaster entity = new DefectMaster();
        entity.setDefectCode(generateDefectCode());
        entity.setDefectName(dto.getDefectName());
        
        // Process 설정
        ProcessInfo process = processInfoRepository.findById(dto.getProcessNo())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setDefectType(dto.getDefectType());
        entity.setDefectLevel(dto.getDefectLevel());
        entity.setJudgmentCriteria(dto.getJudgmentCriteria());
        entity.setUseYn(dto.getUseYn());
        entity.setCreateTime(LocalDateTime.now());
        
        return convertToDefectDTO(defectMasterRepository.save(entity));
    }

    private String generateQcCode() {
        String lastCode = qcMasterRepository.findTopByOrderByQcCodeDesc()
                .map(QcMaster::getQcCode)
                .orElse("QC000");
        
        int sequence = Integer.parseInt(lastCode.replace("QC", "")) + 1;
        return String.format("QC%03d", sequence);
    }

    private String generateDefectCode() {
        String lastCode = defectMasterRepository.findTopByOrderByDefectCodeDesc()
                .map(DefectMaster::getDefectCode)
                .orElse("DF000");
        
        int sequence = Integer.parseInt(lastCode.replace("DF", "")) + 1;
        return String.format("DF%03d", sequence);
    }
    
    @Transactional
    public QcMasterDTO updateQc(QcMasterDTO dto) {
        QcMaster entity = qcMasterRepository.findById(dto.getQcCode())
            .orElseThrow(() -> new RuntimeException("QC not found"));
            
        entity.setQcName(dto.getQcName());
        
        ProcessInfo process = processInfoRepository.findById(dto.getProcessNo())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setTargetValue(dto.getTargetValue());
        entity.setUcl(dto.getUcl());
        entity.setLcl(dto.getLcl());
        entity.setQcMethod(dto.getQcMethod());
        
        CommonDetail unit = commonDetailRepository.findById(dto.getUnitCode())
            .orElseThrow(() -> new RuntimeException("Unit not found"));
        entity.setUnit(unit);
        
        entity.setUseYn(dto.getUseYn());
        entity.setUpdateTime(LocalDateTime.now());
        
        return convertToQcDTO(qcMasterRepository.save(entity));
    }

    @Transactional
    public DefectMasterDTO updateDefect(DefectMasterDTO dto) {
        DefectMaster entity = defectMasterRepository.findById(dto.getDefectCode())
            .orElseThrow(() -> new RuntimeException("Defect not found"));
            
        entity.setDefectName(dto.getDefectName());
        
        ProcessInfo process = processInfoRepository.findById(dto.getProcessNo())
            .orElseThrow(() -> new RuntimeException("Process not found"));
        entity.setProcess(process);
        
        entity.setDefectType(dto.getDefectType());
        entity.setDefectLevel(dto.getDefectLevel());
        entity.setJudgmentCriteria(dto.getJudgmentCriteria());
        entity.setUseYn(dto.getUseYn());
        entity.setUpdateTime(LocalDateTime.now());
        
        return convertToDefectDTO(defectMasterRepository.save(entity));
    }
}