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

    // 국민연금 계산
    public BigDecimal calculateNationalPension(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    // 건강보험 계산
    public BigDecimal calculateHealthInsurance(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    // 장기요양보험 계산
    public BigDecimal calculateLongTermCare(JsonNode formula, PayInfo payInfo) {
        String baseField = formula.get("baseField").asText();
        BigDecimal baseAmount = switch (baseField) {
            case "health_insurance" -> nullToZero(payInfo.getHealthInsurance());
            default -> BigDecimal.ZERO;
        };

        BigDecimal rate = new BigDecimal(formula.get("rate").asText());
        return baseAmount.multiply(rate).setScale(0, RoundingMode.DOWN);
    }

    // 고용보험 계산
    public BigDecimal calculateEmploymentInsurance(JsonNode formula, PayInfo payInfo) {
        return calculatePercentageDeduction(formula, payInfo);
    }

    // 소득세 계산
	public BigDecimal calculateIncomeTax(JsonNode formula, PayInfo payInfo) {
	    BigDecimal monthlyIncome = calculateTaxBase(formula, payInfo);
	    BigDecimal annualIncome = monthlyIncome.multiply(new BigDecimal("12"));
	        
	    BigDecimal totalTax = BigDecimal.ZERO;
	    BigDecimal prevLimit = BigDecimal.ZERO;
	        
	    JsonNode brackets = formula.get("brackets");
	    for (JsonNode bracket : brackets) {
	        JsonNode limitNode = bracket.get("limit");
	        BigDecimal limit = limitNode != null && !limitNode.isNull() ? 
	            new BigDecimal(limitNode.asText()) : null;
	                
	        BigDecimal rate = new BigDecimal(bracket.get("rate").asText());
	            
	        if (limit == null || annualIncome.compareTo(limit) > 0) {
	            BigDecimal taxableAmount = limit != null ? limit.subtract(prevLimit) : annualIncome.subtract(prevLimit);
	            BigDecimal tax = taxableAmount.multiply(rate);
	            totalTax = totalTax.add(tax);
	        } else {
	            BigDecimal taxableAmount = annualIncome.subtract(prevLimit);
	            BigDecimal tax = taxableAmount.multiply(rate);
	            totalTax = totalTax.add(tax);
	            break;
	        }
	            
	        prevLimit = limit != null ? limit : prevLimit;
	    }
	        
	    return totalTax.divide(new BigDecimal("12"), 0, RoundingMode.DOWN);
	}

    // 지방소득세 계산
    public BigDecimal calculateResidentTax(JsonNode formula, PayInfo payInfo) {
        String baseField = formula.get("baseField").asText();
        if ("income_tax".equals(baseField)) {
            BigDecimal rate = new BigDecimal(formula.get("rate").asText());
            return payInfo.getIncomeTax().multiply(rate).setScale(0, RoundingMode.DOWN);
        }
        return BigDecimal.ZERO;
    }

    // 비율 기반 공제 계산 (국민연금, 건강보험, 고용보험)
    private BigDecimal calculatePercentageDeduction(JsonNode formula, PayInfo payInfo) {
        
        BigDecimal base = BigDecimal.ZERO;
        JsonNode baseFields = formula.get("baseFields");
        
        for (JsonNode field : baseFields) {
            String fieldName = field.asText();
            
            switch (fieldName) {
                case "emp_salary" -> {
                    BigDecimal salary = new BigDecimal(payInfo.getEmpSalary());
                    base = base.add(salary);
                }
                case "allow_amt" -> {
                    if (payInfo.getAllowAmt() != null) {
                        base = base.add(payInfo.getAllowAmt());
                    }
                }
            }
        }
        
        BigDecimal rate = new BigDecimal(formula.get("rate").asText());
        BigDecimal result = base.multiply(rate).setScale(0, RoundingMode.DOWN);
        return result;
    }

    // 세금 계산 기준금액 계산
    private BigDecimal calculateTaxBase(JsonNode formula, PayInfo payInfo) {
        BigDecimal base = BigDecimal.ZERO;
        JsonNode baseFields = formula.get("baseFields");
            
        for (JsonNode field : baseFields) {
            switch (field.asText()) {
                case "emp_salary" -> {
                    if (payInfo.getEmpSalary() > 0) {
                        base = base.add(new BigDecimal(payInfo.getEmpSalary()));
                    }
                }
                case "allow_amt" -> {
                    if (payInfo.getAllowAmt() != null) {
                        base = base.add(payInfo.getAllowAmt());
                    }
                }
            }
        }
        
        // 4대보험 공제액 계산
        base = base.subtract(payInfo.getNationalPension())
                   .subtract(payInfo.getHealthInsurance())
                   .subtract(payInfo.getLongtermCareInsurance())
                   .subtract(payInfo.getEmploymentInsurance());
            
        return base;
    }
    
    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}