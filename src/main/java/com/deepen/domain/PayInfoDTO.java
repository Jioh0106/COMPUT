package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.deepen.entity.PayInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayInfoDTO {
    // 기본 식별 정보
    private Long paymentNo;          // 급여내역번호

    // 직원 기본 정보
    private String empId;            // 사원번호
    private String empName;          // 사원이름
    private String empJobType;       // 고용형태

    // 부서 정보
    private String departmentName;    // 부서명
    private String departmentCode;    // 부서코드

    // 직급 정보
    private String positionName;      // 직급명
    private String positionCode;      // 직급코드

    // 급여 지급 정보
    private String paymentDate;       // 지급일자
    private int empSalary;           // 실제 지급 기본급
    private int originalEmpSalary;    // 원본 기본급
    private String adjustReason;      // 기본급 조정사유

    // 수당 정보
    private BigDecimal techAllowance;        // 기술수당
    private BigDecimal tenureAllowance;      // 근속수당
    private BigDecimal performanceBonus;     // 성과급
    private BigDecimal holidayAllowance;     // 명절수당
    private BigDecimal leaveAllowance;       // 휴가수당
    private BigDecimal allowAmt;             // 수당총액

    // 공제 정보
    private BigDecimal nationalPension;        // 국민연금
    private BigDecimal longtermCareInsurance;  // 장기요양보험
    private BigDecimal healthInsurance;        // 건강보험
    private BigDecimal employmentInsurance;    // 고용보험
    private BigDecimal incomeTax;              // 소득세
    private BigDecimal residentTax;            // 주민세
    private BigDecimal deducAmt;               // 공제총액

    // 최종 급여 정보
    private BigDecimal netSalary;             // 실수령액

    // 이력 관리 정보
    private LocalDateTime createAt;           // 등록일자
    private String createBy;                  // 등록자

    /**
     * PayInfo 엔티티로 변환
     */
    public PayInfo toEntity() {
        PayInfo payInfo = new PayInfo();
        
        // 기본 정보 설정
        payInfo.setPaymentNo(this.paymentNo);
        payInfo.setEmpId(this.empId);
        payInfo.setPaymentDate(this.paymentDate);
        
        // 급여 정보 설정
        payInfo.setEmpSalary(this.empSalary);
        
        // 수당 정보 설정
        payInfo.setTechAllowance(this.techAllowance);
        payInfo.setPerformanceBonus(this.performanceBonus);
        payInfo.setTenureAllowance(this.tenureAllowance);
        payInfo.setHolidayAllowance(this.holidayAllowance);
        payInfo.setLeaveAllowance(this.leaveAllowance);
        payInfo.setAllowAmt(this.allowAmt);
        
        // 공제 정보 설정
        payInfo.setNationalPension(this.nationalPension);
        payInfo.setLongtermCareInsurance(this.longtermCareInsurance);
        payInfo.setHealthInsurance(this.healthInsurance);
        payInfo.setEmploymentInsurance(this.employmentInsurance);
        payInfo.setIncomeTax(this.incomeTax);
        payInfo.setResidentTax(this.residentTax);
        payInfo.setDeducAmt(this.deducAmt);
        
        // 최종 급여 설정
        payInfo.setNetSalary(this.netSalary);
        
        // 이력 정보 설정
        payInfo.setCreateAt(this.createAt);
        payInfo.setCreateBy(this.createBy);
        
        return payInfo;
    }

    /**
     * Entity로부터 DTO 생성
     */
    public static PayInfoDTO fromEntity(PayInfo payInfo, String empName, 
            String departmentName, String departmentCode, 
            String positionName, String positionCode,
            int originalEmpSalary, String empJobType) {
            
        return PayInfoDTO.builder()
            .paymentNo(payInfo.getPaymentNo())
            .empId(payInfo.getEmpId())
            .empName(empName)
            .empJobType(empJobType)
            .departmentName(departmentName)
            .departmentCode(departmentCode)
            .positionName(positionName)
            .positionCode(positionCode)
            .paymentDate(payInfo.getPaymentDate())
            .empSalary(payInfo.getEmpSalary())
            .originalEmpSalary(originalEmpSalary)
            .adjustReason(empJobType.equals("OCPT002") ? "계약직 기본급 90% 적용" : null)
            .techAllowance(payInfo.getTechAllowance())
            .tenureAllowance(payInfo.getTenureAllowance())
            .performanceBonus(payInfo.getPerformanceBonus())
            .holidayAllowance(payInfo.getHolidayAllowance())
            .leaveAllowance(payInfo.getLeaveAllowance())
            .allowAmt(payInfo.getAllowAmt())
            .nationalPension(payInfo.getNationalPension())
            .longtermCareInsurance(payInfo.getLongtermCareInsurance())
            .healthInsurance(payInfo.getHealthInsurance())
            .employmentInsurance(payInfo.getEmploymentInsurance())
            .incomeTax(payInfo.getIncomeTax())
            .residentTax(payInfo.getResidentTax())
            .deducAmt(payInfo.getDeducAmt())
            .netSalary(payInfo.getNetSalary())
            .createAt(payInfo.getCreateAt())
            .createBy(payInfo.getCreateBy())
            .build();
    }
}