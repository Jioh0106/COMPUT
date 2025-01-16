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
            log.info("급여 계산 시작 - 직원ID: {}, 계산식 코드: {}", emp.getEmp_id(), formulaCode);
            log.info("계산식 내용: {}", formula.toString());
            
            String type = formula.get("type").asText();
            log.info("계산 유형: {}", type);
            
            BigDecimal result;
            
            // 수당 계산
            if (formulaCode.startsWith("RWRD")) {
                log.info("수당 계산 시작 - 유형: {}", type);
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
                        log.warn("알 수 없는 수당 유형: {}", type);
                        yield BigDecimal.ZERO;
                    }
                };
            }
            
            // 공제 계산
            else if (formulaCode.startsWith("DDCT")) {
                log.info("공제 계산 시작 - 코드: {}", formulaCode);
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
                        log.warn("알 수 없는 공제 코드: {}", formulaCode);
                        yield BigDecimal.ZERO;
                    }
                };
            }
            else {
                log.warn("알 수 없는 계산식 코드: {}", formulaCode);
                result = BigDecimal.ZERO;
            }
            
            log.info("최종 계산 결과 - 코드: {}, 금액: {}", formulaCode, result);
            return result;
            
        } catch (Exception e) {
            log.error("급여 계산 중 오류 발생 - 코드: {}, 에러: {}", formulaCode, e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }
}