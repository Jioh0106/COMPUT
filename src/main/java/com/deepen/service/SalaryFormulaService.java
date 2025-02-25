package com.deepen.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.SalaryFormula;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.SalaryFormulaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryFormulaService {
    
    private final SalaryFormulaRepository salaryFormulaRepository;
    private final CommonDetailRepository commonDetailRepository;
    
    // 코드 중복 검사
    public boolean existsByFormulaName(String name) {
    	return salaryFormulaRepository.existsByFormulaName(name);
    }
    
    // 중복 검사 메서드
    private void validateDuplicate(String formulaName) {
    	// 코드 중복 검사
    	if (salaryFormulaRepository.existsByFormulaName(formulaName)) {
    		throw new RuntimeException("이미 존재하는 급여 코드입니다.");
    	}
    }
    
    
    @Transactional
    public void save(SalaryFormulaDTO dto) {
        try {
        	
        	validateDuplicate(dto.getFormulaName());
        	
        	CommonDetail commonDetail = commonDetailRepository.findById(dto.getFormulaCode())
                    .orElseThrow(() -> new RuntimeException("해당 구분 코드를 찾을 수 없습니다."));
            
            SalaryFormula formula = new SalaryFormula();
            formula.setFormulaName(dto.getFormulaName());
            formula.setFormulaType(dto.getFormulaType());
            formula.setFormulaContent(dto.getFormulaContent());
            formula.setApplyYear(dto.getApplyYear());
            formula.setFormulaPriority(dto.getFormulaPriority());
            formula.setUpdatedAt(LocalDateTime.now());
            formula.setFormulaComment(dto.getFormulaComment());
            formula.setCommonDetail(commonDetail);
            
            salaryFormulaRepository.save(formula);
            
        } catch (Exception e) {
            throw new RuntimeException("급여 공식 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Transactional
    public void update(SalaryFormulaDTO dto) {
        SalaryFormula formula = salaryFormulaRepository.findById(dto.getFormulaId())
            .orElseThrow(() -> new RuntimeException("해당 급여 공식을 찾을 수 없습니다."));
        
        // SalaryFormula 업데이트
        formula.setFormulaName(dto.getFormulaName());
        formula.setFormulaType(dto.getFormulaType());
        formula.setFormulaContent(dto.getFormulaContent());
        formula.setApplyYear(dto.getApplyYear());
        formula.setFormulaPriority(dto.getFormulaPriority());
        formula.setUpdatedAt(LocalDateTime.now());
        formula.setFormulaComment(dto.getFormulaComment());
        
        salaryFormulaRepository.save(formula);
    }

    @Transactional
    public void deleteByIds(List<Long> ids) {
        List<SalaryFormula> formulas = salaryFormulaRepository.findAllById(ids);
        
        salaryFormulaRepository.deleteAllInBatch(formulas);
    }
    
    public List<Map<String, String>> getFormulaTypes() {
        List<Map<String, String>> result = new ArrayList<>();
        
        // DDCT(공제) 데이터 조회
        List<CommonDetail> deductions = commonDetailRepository
            .findByCommon_detail_codeStartingWithOrderByCommon_detail_codeDesc("DDCT");
        // RWRD(수당) 데이터 조회
        List<CommonDetail> rewards = commonDetailRepository
            .findByCommon_detail_codeStartingWithOrderByCommon_detail_codeDesc("RWRD");
        
        for (CommonDetail detail : deductions) {
            Map<String, String> item = new HashMap<>();
            item.put("code", detail.getCommon_detail_code());
            item.put("name", detail.getCommon_detail_name());
            item.put("type", "공제");
            result.add(item);
        }
        
        for (CommonDetail detail : rewards) {
            Map<String, String> item = new HashMap<>();
            item.put("code", detail.getCommon_detail_code());
            item.put("name", detail.getCommon_detail_name());
            item.put("type", "수당");
            result.add(item);
        }
        
        return result;
    }
    
    public List<SalaryFormula> findAll() {
        return salaryFormulaRepository.findAll();
    }
    
    // 휴가수당 계산식 생성
    public SalaryFormula createLeaveAllowanceFormula() {
        SalaryFormula formula = new SalaryFormula();
        formula.setFormulaName("휴가수당");
        formula.setFormulaType("RWRD");
        
        JsonNode formulaContent = createLeaveAllowanceFormulaContent();
        formula.setFormulaContent(formulaContent.toString());
        
        formula.setApplyYear(LocalDate.now().getYear());
        formula.setFormulaPriority(5); // 우선순위 설정
        formula.setUpdatedAt(LocalDateTime.now());
        
        // CommonDetail 설정
        CommonDetail commonDetail = new CommonDetail();
        commonDetail.setCommon_detail_code("RWRD005"); // 휴가수당 코드
        formula.setCommonDetail(commonDetail);
        
        return formula;
    }

    private JsonNode createLeaveAllowanceFormulaContent() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode content = mapper.createObjectNode();
        
        content.put("type", "leave");
        content.put("rate", "1.5");
        content.put("workingDays", "22");
        
        ArrayNode baseFields = mapper.createArrayNode();
        baseFields.add("emp_salary");
        content.set("baseFields", baseFields);
        
        return content;
    }

}