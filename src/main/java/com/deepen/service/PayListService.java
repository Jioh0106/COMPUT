package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import com.deepen.domain.PayListDTO;
import com.deepen.mapper.PayListMapper;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@Transactional
@RequiredArgsConstructor
@Log
public class PayListService {
    
    private final PayListMapper payListMapper;

    // 월별 급여 대장 요약 정보
    public List<PayListDTO> getMonthlyPayrollSummary(String department, String keyword){
        return payListMapper.getMonthlyPayrollSummary(department, keyword);
    }

    // 특정 월의 급여 대장 상세 정보
    public List<PayListDTO> getMonthlyPayrollDetail(String paymentDate, String department){
        return payListMapper.getMonthlyPayrollDetail(paymentDate, department);
    }
    // 특정 월의 부서별 급여 통계
    public Map<String, Object> getDepartmentPayrollStats(@Param("paymentDate") String paymentDate){
        return payListMapper.getDepartmentPayrollStats(paymentDate);
    }
    
    //연간 급여 대장
    public List<PayListDTO> getAnnualPayrollData(String year){
        return payListMapper.getAnnualPayrollData(year);
    }
}