package com.deepen.calculator;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.deepen.entity.Employees;
import com.deepen.entity.PayInfo;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SalaryFormulaCalculator {

    private final AllowanceCalculator allowanceCalculator;
    private final DeductionCalculator deductionCalculator;

    /**
     * 급여 계산 수행
     */
    public BigDecimal calculate(
            JsonNode formula, 
            Employees emp, 
            int currentMonth,
            PayInfo payInfo,
            String formulaCode) {  // formulaCode 파라미터 위치 변경
            
        try {
            String type = formula.get("type").asText();
            
            // 수당 계산
            if (formulaCode.startsWith("RWRD")) {
                return switch (type) {
                    case "fixed" -> allowanceCalculator.calculateTechAllowance(formula);
                    case "performance" -> allowanceCalculator.calculatePerformanceBonus(formula, emp, currentMonth);
                    case "tenure" -> allowanceCalculator.calculateTenureAllowance(formula, emp);
                    case "holiday" -> allowanceCalculator.calculateHolidayAllowance(formula, emp, currentMonth);
                    case "leave" -> allowanceCalculator.calculateLeaveAllowance(formula, emp);
                    default -> BigDecimal.ZERO;
                };
            }
            
            // 공제 계산
            if (formulaCode.startsWith("DDCT")) {
                return switch (formulaCode) {
                    case "DDCT001" -> deductionCalculator.calculateNationalPension(formula, payInfo);
                    case "DDCT002" -> deductionCalculator.calculateHealthInsurance(formula, payInfo);
                    case "DDCT003" -> deductionCalculator.calculateLongTermCare(formula, payInfo);
                    case "DDCT004" -> deductionCalculator.calculateEmploymentInsurance(formula, payInfo);
                    case "DDCT005" -> deductionCalculator.calculateIncomeTax(formula, payInfo);
                    case "DDCT006" -> deductionCalculator.calculateResidentTax(formula, payInfo);
                    default -> BigDecimal.ZERO;
                };
            }
            
            return BigDecimal.ZERO;
            
        } catch (Exception e) {
            log.error("급여 계산 중 오류 발생: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }
}