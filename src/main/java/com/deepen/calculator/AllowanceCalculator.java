package com.deepen.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.deepen.entity.Employees;
import com.deepen.mapper.VacationMapper;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AllowanceCalculator {
	
	private final VacationMapper vacationMapper;
	
    public AllowanceCalculator(VacationMapper vacationMapper) {
        this.vacationMapper = vacationMapper;
    }

    /**
     * 기술수당 계산
     */
	public BigDecimal calculateTechAllowance(JsonNode formula, Employees emp) {
	    if (!"OCPT003".equals(emp.getEmp_job_type())) {
	        return BigDecimal.ZERO;
	    }
	    
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
	        return BigDecimal.ZERO;
	    }

	    JsonNode rates = formula.get("rates");
	    if (rates.has(mappedRank)) {
	        BigDecimal result = new BigDecimal(emp.getEmp_salary())
	            .multiply(new BigDecimal(rates.get(mappedRank).asText()));
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
    
    public BigDecimal calculateLeaveAllowance(JsonNode formula, Employees emp, int currentMonth) {
        try {
            // 1. 지급월 체크
            JsonNode months = formula.get("months");
            if (months != null && months.isArray()) {
                boolean isPaymentMonth = false;
                for (JsonNode month : months) {
                    if (month.asInt() == currentMonth) {
                        isPaymentMonth = true;
                        break;
                    }
                }
                if (!isPaymentMonth) {
                    return BigDecimal.ZERO;
                }
            } else {
                if (currentMonth != 12) {
                    return BigDecimal.ZERO;
                }
            }

            // 2. 총 급여 계산을 위한 기본값 설정
            BigDecimal baseSalary = new BigDecimal(emp.getEmp_salary())
                .divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);  // 월급여로 환산
                
            // 3. 근무일수 설정
            BigDecimal workingDays = formula.has("baseDays") ? 
                new BigDecimal(formula.get("baseDays").asText()) : 
                new BigDecimal("21.5");
                
            // 4. 일당 계산 (월급/근무일수)    
            BigDecimal dailyRate = baseSalary
                .divide(workingDays, 2, RoundingMode.HALF_UP);
                
            // 5. 미사용 휴가 일수 조회
            Map<String, Object> vacationInfo = vacationMapper.vctnDays(emp.getEmp_id());
            if (vacationInfo == null || !vacationInfo.containsKey("total")) {
                return BigDecimal.ZERO;
            }
            
            int usedDays = Integer.parseInt(vacationInfo.get("total").toString());
            final int TOTAL_LEAVE_DAYS = 15;  // 연간 총 휴가 일수
            int unusedDays = TOTAL_LEAVE_DAYS - usedDays;
            
            if (unusedDays <= 0) {
                return BigDecimal.ZERO;
            }

            // 6. 휴가수당 계산
            BigDecimal allowanceAmount = dailyRate
                .multiply(new BigDecimal(unusedDays))
                .setScale(0, RoundingMode.DOWN);
            return allowanceAmount;

        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * 지급월 여부 확인
     */
    private boolean isPaymentMonth(JsonNode months, int currentMonth) {
        if (months == null || !months.isArray()) {
            return true;
        }

        for (JsonNode month : months) {
            if (month.asInt() == currentMonth) {
                return true;
            }
        }
        return false;
    }

    /**
     * 일당 계산 헬퍼 메서드
     */
    private BigDecimal calculateDailyRate(int salary, int workingDays) {
        return new BigDecimal(salary)
            .divide(new BigDecimal(workingDays), 2, RoundingMode.HALF_UP);
    }

    /**
     * 휴가 일수 유효성 검사
     */
    private boolean isValidVacationDays(int days) {
        return days >= 0 && days <= 30; // 최대 30일로 제한
    }

    /**
     * 근속연수 계산
     */
    private int calculateYearsOfService(Employees emp) {
        return YearMonth.now().getYear() - emp.getEmp_hire_date().getYear();
    }
}