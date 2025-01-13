package com.deepen.calculator;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.deepen.entity.Employees;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AllowanceCalculator {

    /**
     * 기술수당 계산
     */
	public BigDecimal calculateTechAllowance(JsonNode formula, Employees emp) {
	    if (!"OCPT003".equals(emp.getEmp_job_type())) {
	        log.info("기술직이 아닌 직원: empId={}, jobType={}", emp.getEmp_id(), emp.getEmp_job_type());
	        return BigDecimal.ZERO;
	    }
	    
	    log.info("기술수당 계산: empId={}, amount={}", emp.getEmp_id(), formula.get("amount").asText());
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

	    // 등급 매핑
	    Map<String, String> rankMapping = Map.of(
	        "RANK001", "A",
	        "RANK002", "B",
	        "RANK003", "C",
	        "RANK004", "D",
	        "RANK005", "F"
	    );

	    String empRank = emp.getEmp_perf_rank();
	    String mappedRank = rankMapping.get(empRank);
	    
	    if (mappedRank == null) {
	        log.warn("알 수 없는 성과 등급: empId={}, rank={}", emp.getEmp_id(), empRank);
	        return BigDecimal.ZERO;
	    }

	    JsonNode rates = formula.get("rates");
	    if (rates.has(mappedRank)) {
	        BigDecimal result = new BigDecimal(emp.getEmp_salary())
	            .multiply(new BigDecimal(rates.get(mappedRank).asText()));
	        log.info("성과수당 계산: empId={}, rank={}, amount={}", 
	            emp.getEmp_id(), mappedRank, result);
	        return result;
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