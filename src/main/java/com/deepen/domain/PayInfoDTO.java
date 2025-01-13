package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayInfoDTO {
    private Long paymentNo;                    // 급여내역번호
    private String empId;                      // 사원번호
    private String empName;                    // 사원이름
    private String departmentName;             // 부서명 
    private String positionName;               // 직급명
    private String paymentDate;                // 지급일자
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
    private LocalDateTime createAt;            // 등록일자 
    private String createBy;                   // 등록자
}
