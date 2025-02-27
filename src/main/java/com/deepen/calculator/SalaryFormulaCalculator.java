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

    public BigDecimal calculate(
            JsonNode formula, 
            Employees emp, 
            int currentMonth,
            PayInfo payInfo,
            String formulaCode) {  
            
        try {
            String type = formula.get("type").asText();
            
            BigDecimal result;
            
            // 수당 계산
            if (formulaCode.startsWith("RWRD")) {
                result = switch (type) {
                    case "fixed" -> {
                        BigDecimal amount = allowanceCalculator.calculateTechAllowance(formula, emp);
                        yield amount;
                    }
                    case "performance" -> {
                        BigDecimal amount = allowanceCalculator.calculatePerformanceBonus(formula, emp, currentMonth);
                        yield amount;
                    }
                    case "tenure" -> {
                        BigDecimal amount = allowanceCalculator.calculateTenureAllowance(formula, emp);
                        yield amount;
                    }
                    case "holiday" -> {
                        BigDecimal amount = allowanceCalculator.calculateHolidayAllowance(formula, emp, currentMonth);
                        yield amount;
                    }
                    case "leave" -> {
                        BigDecimal amount = allowanceCalculator.calculateLeaveAllowance(formula, emp, currentMonth);
                        yield amount;
                    }
                    default -> {
                        yield BigDecimal.ZERO;
                    }
                };
            }
            
            // 공제 계산
            else if (formulaCode.startsWith("DDCT")) {
                result = switch (formulaCode) {
                    case "DDCT001" -> {
                        BigDecimal amount = deductionCalculator.calculateNationalPension(formula, payInfo);
                        yield amount;
                    }
                    case "DDCT002" -> {
                        BigDecimal amount = deductionCalculator.calculateHealthInsurance(formula, payInfo);
                        yield amount;
                    }
                    case "DDCT003" -> {
                        BigDecimal amount = deductionCalculator.calculateLongTermCare(formula, payInfo);
                        yield amount;
                    }
                    case "DDCT004" -> {
                        BigDecimal amount = deductionCalculator.calculateEmploymentInsurance(formula, payInfo);
                        yield amount;
                    }
                    case "DDCT005" -> {
                        BigDecimal amount = deductionCalculator.calculateIncomeTax(formula, payInfo);
                        yield amount;
                    }
                    case "DDCT006" -> {
                        BigDecimal amount = deductionCalculator.calculateResidentTax(formula, payInfo);
                        yield amount;
                    }
                    default -> {
                        yield BigDecimal.ZERO;
                    }
                };
            }
            else {
                result = BigDecimal.ZERO;
            }
            
            return result;
            
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}