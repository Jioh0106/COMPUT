package com.deepen.domain;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PayListDTO {
    // 기존 필드 (요약 정보용)
    private String paymentDate;				   // 지급월
    private String payrollName;				   // 대장명칭
    private int headcount;					   // 인원수
    private BigDecimal totalAmount;            // 지급총액
    private BigDecimal totalAllowance;		   // 수당총액
    private BigDecimal totalDeduction;         // 공제총액

    // 상세 정보용 필드 추가
    private String empId;                      // 사원번호
    private String empName;                    // 사원이름
    private String departmentName;             // 부서명 
    private String positionName;               // 직급명
    private int empSalary;                     // 기본급여
    private BigDecimal techAllowance;          // 기술수당
    private BigDecimal tenureAllowance;        // 근속수당
    private BigDecimal performanceBonus;       // 성과급 
    private BigDecimal holidayAllowance;       // 명절수당
    private BigDecimal leaveAllowance;         // 휴가수당 
    private BigDecimal allowAmt;               // 수당총액
    private BigDecimal nationalPension;        // 국민연금
    private BigDecimal longtermCareInsurance;  // 장기요양보험
    private BigDecimal healthInsurance;        // 건강보험
    private BigDecimal employmentInsurance;    // 고용보험
    private BigDecimal incomeTax;              // 소득세
    private BigDecimal residentTax;            // 주민세
    private BigDecimal deducAmt;               // 공제총액
    private BigDecimal netSalary;              // 실수령액
    private LocalDateTime createdAt;		   // 작성일
}
