package com.deepen.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
public class PayInfo {
	 
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
	@SequenceGenerator(
	        name = "payment_seq",
	        sequenceName = "payment_seq",
	        allocationSize = 1
	   )
	@Column(name = "payment_no")
	private Long paymentNo; //급여 내역 번호
	 
    @Column(name = "emp_id")
    private String empId; //사원번호 fk
    
    @Column(name = "payment_date")
    private String paymentDate; //지급일
    
    @Column(name = "emp_salary")
    private int empSalary; //기본급 fk
    
    @Column(name = "allow_amt")
    private BigDecimal allowAmt; //총수당액
    
    @Column(name = "deduc_amt")
    private BigDecimal deducAmt; //총공제액
    
    @Column(name = "net_salary")
    private BigDecimal netSalary; //총급여액
    
    @Column(name = "created_at")
    private LocalDateTime createAt; //작성일
    
    @Column(name = "created_by")
    private String createBy; //작성자 
    
    @Column(name = "TECH_ALLOWANCE")
    private BigDecimal techAllowance; // 기술수당 

    @Column(name = "PERFORMANCE_BONUS")
    private BigDecimal performanceBonus; // 성과금 

    @Column(name = "TENURE_ALLOWANCE")
    private BigDecimal tenureAllowance;	// 근속수당 

    @Column(name = "HOLIDAY_ALLOWANCE")
    private BigDecimal holidayAllowance; // 명절수당

    @Column(name = "LEAVE_ALLOWANCE")
    private BigDecimal leaveAllowance; // 휴가수당

    @Column(name = "NATIONAL_PENSION")
    private BigDecimal nationalPension; // 국민연금 

    @Column(name = "HEALTH_INSURANCE")
    private BigDecimal healthInsurance; // 건강보험

    @Column(name = "LONGTERM_CARE_INSURANCE")
    private BigDecimal longtermCareInsurance; // 장기요양보험

    @Column(name = "EMPLOYMENT_INSURANCE")
    private BigDecimal employmentInsurance; // 고용보험 
    
    @Column(name = "INCOME_TAX")
    private BigDecimal incomeTax; // 소득세 
  
    @Column(name = "RESIDENT_TAX")
    private BigDecimal residentTax; // 지방세 

	}

