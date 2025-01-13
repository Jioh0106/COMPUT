package com.deepen.service;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.deepen.service.PayrollCalculatorService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
class PayrollCalculatorServiceTest {

    @Autowired
    private PayrollCalculatorService calculatorService;
    
    @Test
    @DisplayName("ATHR001 직원의 2025년 1월 급여 계산 테스트")
    void testCalculateSalary() {
        // given
        String empId = "ATHR001";
        String paymentDate = "2025-01";

        // when
        Map<String, Object> result = calculatorService.testCalculateSalary(empId, paymentDate);
        
        // then
        log.info("=== 급여 계산 결과 ===");
        log.info("기본급: {}", result.get("employeeSalary"));
        
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> allowances = (Map<String, BigDecimal>) result.get("allowances");
        log.info("=== 수당 내역 ===");
        allowances.forEach((key, value) -> log.info("{}: {}", key, value));
        
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> deductions = (Map<String, BigDecimal>) result.get("deductions");
        log.info("=== 공제 내역 ===");
        deductions.forEach((key, value) -> log.info("{}: {}", key, value));
        
        log.info("총 수당: {}", result.get("totalAllowance"));
        log.info("총 공제: {}", result.get("totalDeduction"));
        log.info("실수령액: {}", result.get("netSalary"));
        
        // 검증
        assertTrue((Boolean) result.get("success"), "급여 계산이 성공해야 합니다.");
        assertNotNull(result.get("allowances"), "수당 정보가 있어야 합니다.");
        assertNotNull(result.get("deductions"), "공제 정보가 있어야 합니다.");
        assertNotNull(result.get("netSalary"), "실수령액이 계산되어야 합니다.");
        
        // 수당 검증
        assertNotNull(allowances.get("기술수당"), "기술수당이 계산되어야 합니다.");
        assertNotNull(allowances.get("성과수당"), "성과수당이 계산되어야 합니다.");
        assertNotNull(allowances.get("근속수당"), "근속수당이 계산되어야 합니다.");
        assertNotNull(allowances.get("명절수당"), "명절수당이 계산되어야 합니다.");
        
        // 공제 검증
        assertNotNull(deductions.get("국민연금"), "국민연금이 계산되어야 합니다.");
        assertNotNull(deductions.get("건강보험"), "건강보험이 계산되어야 합니다.");
        assertNotNull(deductions.get("장기요양보험"), "장기요양보험이 계산되어야 합니다.");
        assertNotNull(deductions.get("고용보험"), "고용보험이 계산되어야 합니다.");
        assertNotNull(deductions.get("소득세"), "소득세가 계산되어야 합니다.");
        assertNotNull(deductions.get("주민세"), "주민세가 계산되어야 합니다.");
        
        // 금액 검증
        assertTrue(((BigDecimal) result.get("totalAllowance")).compareTo(BigDecimal.ZERO) > 0, 
            "총 수당은 0보다 커야 합니다.");
        assertTrue(((BigDecimal) result.get("totalDeduction")).compareTo(BigDecimal.ZERO) > 0, 
            "총 공제는 0보다 커야 합니다.");
        assertTrue(((BigDecimal) result.get("netSalary")).compareTo(BigDecimal.ZERO) > 0, 
            "실수령액은 0보다 커야 합니다.");
    }
}