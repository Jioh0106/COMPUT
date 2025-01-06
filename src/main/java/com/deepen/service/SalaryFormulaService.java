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
    
    @Transactional
    public void save(SalaryFormulaDTO dto) {
        try {
            // 1. 코드 생성
            String newCode = generateCode(dto.getFormulaType());
            
            // 2. CommonDetail 저장
            CommonDetail commonDetail = new CommonDetail();
            commonDetail.setCommon_detail_code(newCode);
            commonDetail.setCommon_detail_name(dto.getFormulaName());
            commonDetail.setCommon_detail_status("Y");
            // common_detail_display는 기본값 1 사용
            
            CommonDetail savedCommonDetail = commonDetailRepository.save(commonDetail);
            
            // 3. SalaryFormula 저장
            SalaryFormula formula = new SalaryFormula();
            formula.setFormulaName(dto.getFormulaName());
            formula.setFormulaType(dto.getFormulaType());
            formula.setFormulaContent(dto.getFormulaContent());
            formula.setApplyYear(dto.getApplyYear());
            formula.setFormulaPriority(dto.getFormulaPriority());
            formula.setUpdatedAt(LocalDateTime.now());
            formula.setCommonDetail(savedCommonDetail);
            
            salaryFormulaRepository.save(formula);
            
        } catch (Exception e) {
            throw new RuntimeException("급여 공식 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    private String generateCode(String type) {
        String prefix = "수당".equals(type) ? "RWRD" : "DDCT";
        List<CommonDetail> details = commonDetailRepository.findByCommon_detail_codeStartingWith(prefix);
        
        int nextNum = 1;
        if (!details.isEmpty()) {
            String lastCode = details.get(0).getCommon_detail_code();
            try {
                nextNum = Integer.parseInt(lastCode.substring(4)) + 1;
            } catch (NumberFormatException | IndexOutOfBoundsException e) {
                nextNum = 1;
            }
        }
        return String.format("%s%03d", prefix, nextNum);
    }

    public List<SalaryFormula> findAll() {
        return salaryFormulaRepository.findAll();
    }
}