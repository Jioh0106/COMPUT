package com.deepen.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

import com.deepen.entity.PayInfo;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DeductionCalculator {

    /**
     * 국민연금 계산
     */
    public BigDecimal calculateNationalPension(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    /**
     * 건강보험 계산
     */
    public BigDecimal calculateHealthInsurance(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    /**
     * 장기요양보험 계산
     */
    public BigDecimal calculateLongTermCare(JsonNode formula, PayInfo payInfo) {
        String baseField = formula.get("baseField").asText();
        BigDecimal baseAmount = switch (baseField) {
            case "health_insurance" -> payInfo.getHealthInsurance();
            default -> BigDecimal.ZERO;
        };

        BigDecimal rate = new BigDecimal(formula.get("rate").asText());
        return baseAmount.multiply(rate).setScale(0, RoundingMode.DOWN);
    }

    /**
     * 고용보험 계산
     */
    public BigDecimal calculateEmploymentInsurance(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    /**
     * 소득세 계산
     */
    public BigDecimal calculateIncomeTax(JsonNode formula, PayInfo payInfo) {
        BigDecimal monthlyIncome = calculateTaxBase(formula, payInfo);
        BigDecimal annualIncome = monthlyIncome.multiply(new BigDecimal("12"));
        
        JsonNode brackets = formula.get("brackets");
        for (JsonNode bracket : brackets) {
            JsonNode limit = bracket.get("limit");
            if (limit == null || annualIncome.compareTo(new BigDecimal(limit.asText())) <= 0) {
                BigDecimal rate = new BigDecimal(bracket.get("rate").asText());
                return monthlyIncome.multiply(rate).setScale(0, RoundingMode.DOWN);
            }
        }
        
        return BigDecimal.ZERO;
    }

    /**
     * 지방소득세 계산
     */
    public BigDecimal calculateResidentTax(JsonNode formula, PayInfo payInfo) {
        String baseField = formula.get("baseField").asText();
        if ("income_tax".equals(baseField)) {
            BigDecimal rate = new BigDecimal(formula.get("rate").asText());
            return payInfo.getIncomeTax().multiply(rate).setScale(0, RoundingMode.DOWN);
        }
        return BigDecimal.ZERO;
    }

    /**
     * 비율 기반 공제 계산 (국민연금, 건강보험, 고용보험)
     */
    private BigDecimal calculatePercentageDeduction(JsonNode formula, PayInfo payInfo) {
        BigDecimal base = BigDecimal.ZERO;
        JsonNode baseFields = formula.get("baseFields");
        
        for (JsonNode field : baseFields) {
            switch (field.asText()) {
                case "emp_salary" -> base = base.add(new BigDecimal(payInfo.getEmpSalary()));
                case "allow_amt" -> base = base.add(payInfo.getAllowAmt());
            }
        }
        
        BigDecimal rate = new BigDecimal(formula.get("rate").asText());
        return base.multiply(rate).setScale(0, RoundingMode.DOWN);
    }

    /**
     * 세금 계산 기준금액 계산
     */
    private BigDecimal calculateTaxBase(JsonNode formula, PayInfo payInfo) {
        BigDecimal base = BigDecimal.ZERO;
        JsonNode baseFields = formula.get("baseFields");
        
        for (JsonNode field : baseFields) {
            switch (field.asText()) {
                case "emp_salary" -> base = base.add(new BigDecimal(payInfo.getEmpSalary()));
                case "allow_amt" -> base = base.add(payInfo.getAllowAmt());
            }
        }
        
        return base;
    }
}