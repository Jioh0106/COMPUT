package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import com.deepen.domain.PayListDTO;
import com.deepen.mapper.PayListMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@Transactional
@RequiredArgsConstructor
@Log
public class PayListService {
    
    private final PayListMapper payListMapper;

    // 월별 급여 대장 요약 정보
    public List<PayListDTO> getMonthlyPayrollSummary(String department, String keyword) {
        // null을 빈 문자열로 처리
        department = (department == null) ? "" : department.trim();
        keyword = (keyword == null) ? "" : keyword.trim();
        
        log.info("Service - Searching with keyword: " + keyword);
        List<PayListDTO> result = payListMapper.getMonthlyPayrollSummary(department, keyword);
        log.info("Service - Found " + result.size() + " results");
        return result;
    }

    // 특정 월의 급여 대장 상세 정보
    public List<PayListDTO> getMonthlyPayrollDetail(String paymentDate, String department) {
        if (!paymentDate.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("날짜 형식이 올바르지 않습니다. (YYYY-MM)");
        }
        return payListMapper.getMonthlyPayrollDetail(paymentDate, department);
    }
    // 특정 월의 부서별 급여 통계
    public Map<String, Object> getDepartmentPayrollStats(
        @Param("paymentDate") String paymentDate
    ) {
        // 날짜 형식 검증
        if (!paymentDate.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("날짜 형식이 올바르지 않습니다. (YYYY-MM)");
        }
        return payListMapper.getDepartmentPayrollStats(paymentDate);
    }
}