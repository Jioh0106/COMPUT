package com.deepen.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.SalaryFormula;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.SalaryFormulaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryFormulaService {
    
    private final SalaryFormulaRepository salaryFormulaRepository;
    private final CommonDetailRepository commonDetailRepository;
    
    private String generateFormulaCode(String type) {
        String prefix = "수당".equals(type) ? "RWRD" : "DDUC";
        List<CommonDetail> commonDetails = commonDetailRepository
            .findByCommonDetail(prefix);
        
        int nextNum = 1;
        if (!commonDetails .isEmpty()) {
            String lastCode = commonDetails .get(0).getCommon_detail_code();
            nextNum = Integer.parseInt(lastCode.substring(4)) + 1;
        }
        
        return String.format("%s%03d", prefix, nextNum);
    }
    
    @Transactional
    public void save(SalaryFormulaDTO salaryFormulaDTO) {
    	// 1. 코드 생성
        String newCode = generateFormulaCode(salaryFormulaDTO.getFormulaType());
        
        // 2. CommonDetail 먼저 저장
        CommonDetail commonDetail = new CommonDetail();
        commonDetail.setCommon_detail_code(newCode);
        commonDetail.setCommon_detail_name(salaryFormulaDTO.getFormulaName());
        commonDetail.setCommon_detail_status("Y");
        // display 순서는 적절히 설정
        commonDetail.setCommon_detail_display(1);  
        commonDetailRepository.save(commonDetail);
        
        // 3. SalaryFormula 저장
        salaryFormulaDTO.setFormulaCode(newCode);
        salaryFormulaDTO.setUpdatedAt(LocalDateTime.now());
        SalaryFormula formula = SalaryFormula.setSalaryFormulaEntity(salaryFormulaDTO);
        formula.setCommonDetail(commonDetail);
        salaryFormulaRepository.save(formula);
    }
    
    public List<SalaryFormula> findAll() {
        return salaryFormulaRepository.findAll();
    }
}
