package com.deepen.calculator;

import java.math.BigDecimal;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.deepen.entity.Employees;
import com.deepen.entity.PayInfo;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AllowanceCalculator {

    /**
     * 기술수당 계산
     */
    public BigDecimal calculateTechAllowance(JsonNode formula) {
        return new BigDecimal(formula.get("amount").asText());
    }

    /**
     * 성과수당 계산
     */
    public BigDecimal calculatePerformanceBonus(JsonNode formula, Employees emp, int currentMonth) {
        // 지급월 체크
        JsonNode months = formula.get("paymentMonths");
        if (!isPaymentMonth(months, currentMonth)) {
            return BigDecimal.ZERO;
        }

        // 등급에 따른 지급률 적용
        String grade = emp.getEmp_perf_rank();
        JsonNode rates = formula.get("rates");
        if (rates.has(grade)) {
            return new BigDecimal(emp.getEmp_salary())
                .multiply(new BigDecimal(rates.get(grade).asText()));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 근속수당 계산
     */
    public BigDecimal calculateTenureAllowance(JsonNode formula, Employees emp) {
        int years = calculateYearsOfService(emp);
        JsonNode steps = formula.get("steps");
        
        for (JsonNode step : steps) {
            if (years < step.get("years").asInt()) {
                return new BigDecimal(step.get("amount").asText());
            }
        }
        
        // 마지막 단계의 금액 반환
        return new BigDecimal(steps.get(steps.size() - 1).get("amount").asText());
    }

    /**
     * 명절수당 계산
     */
    public BigDecimal calculateHolidayAllowance(JsonNode formula, Employees emp, int currentMonth) {
        JsonNode months = formula.get("months");
        if (!isPaymentMonth(months, currentMonth)) {
            return BigDecimal.ZERO;
        }

        BigDecimal rate = new BigDecimal(formula.get("rate").asText());
        return new BigDecimal(emp.getEmp_salary()).multiply(rate);
    }

    /**
     * 휴가수당 계산
     */
    public BigDecimal calculateLeaveAllowance(JsonNode formula, Employees emp) {
        // TODO: 연차 사용 정보 연동 후 구현
        return BigDecimal.ZERO;
    }

    /**
     * 지급월 여부 확인
     */
    private boolean isPaymentMonth(JsonNode months, int currentMonth) {
        for (JsonNode month : months) {
            if (month.asInt() == currentMonth) {
                return true;
            }
        }
        return false;
    }

    /**
     * 근속연수 계산
     */
    private int calculateYearsOfService(Employees emp) {
        return YearMonth.now().getYear() - emp.getEmp_hire_date().getYear();
    }
}