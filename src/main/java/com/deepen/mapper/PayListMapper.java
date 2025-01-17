package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.PayListDTO;

@Mapper
@Repository
public interface PayListMapper {
	// 월별 급여 대장 요약 정보 조회
    List<PayListDTO> getMonthlyPayrollSummary(
        @Param("department") String department, 
        @Param("keyword") String keyword
    );
    
    // 특정 월 급여 대장 상세 정보 조회
    List<PayListDTO> getMonthlyPayrollDetail(
            @Param("paymentDate") String paymentDate,
            @Param("department") String department
        );

    // 부서별 급여 통계
    Map<String, Object> getDepartmentPayrollStats(
        @Param("paymentDate") String paymentDate
    );
    
 // 연간 급여 대장
    List<PayListDTO> getAnnualPayrollData(@Param("year") String year);
}