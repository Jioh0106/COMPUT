package com.deepen.service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.deepen.calculator.SalaryFormulaCalculator;
import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.Employees;
import com.deepen.entity.PayInfo;
import com.deepen.mapper.SalaryFormulaMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalarySimulatorService {
    
    private final SalaryFormulaMapper salaryFormulaMapper;
    private final SalaryFormulaCalculator calculator;
    private final ObjectMapper objectMapper;

    /**
     * 예상 급여 계산
     */
    public PayInfo simulateSalary(int baseSalary) {
        try {
            log.info("급여 시뮬레이션 시작 - 기본급: {}", baseSalary);

            // 가상의 직원 정보 생성
            Employees simulatedEmployee = new Employees();
            simulatedEmployee.setEmp_salary(baseSalary);
            simulatedEmployee.setEmp_job_type("OCPT001");
            
            // 현재 년도의 급여 계산식 조회
            int currentYear = YearMonth.now().getYear();
            List<SalaryFormulaDTO> formulas = salaryFormulaMapper.getCurrentFormulas(currentYear);
            
            if (formulas.isEmpty()) {
                throw new RuntimeException("급여 계산식이 정의되어 있지 않습니다.");
            }

            // 가상의 급여 정보 생성
            PayInfo simulatedPayInfo = new PayInfo();
            simulatedPayInfo.setEmpSalary(baseSalary);
            
            // 각 공제 항목 계산
            BigDecimal totalDeduction = BigDecimal.ZERO;
            
            // 공제 공식 필터링 및 정렬
            List<SalaryFormulaDTO> deductionFormulas = formulas.stream()
                .filter(f -> f.getFormulaCode().startsWith("DDCT"))
                .sorted(Comparator.comparingInt(SalaryFormulaDTO::getFormulaPriority))
                .collect(Collectors.toList());

            // 각 공제 항목 계산
            for (SalaryFormulaDTO formula : deductionFormulas) {
                try {
                    JsonNode content = objectMapper.readTree(formula.getFormulaContent());
                    BigDecimal amount = calculator.calculate(
                        content,
                        simulatedEmployee,
                        YearMonth.now().getMonthValue(),
                        simulatedPayInfo,
                        formula.getFormulaCode()
                    );

                    // 공제 종류별로 설정
                    switch (formula.getFormulaCode()) {
                        case "DDCT001" -> simulatedPayInfo.setNationalPension(amount);
                        case "DDCT002" -> simulatedPayInfo.setHealthInsurance(amount);
                        case "DDCT003" -> simulatedPayInfo.setLongtermCareInsurance(amount);
                        case "DDCT004" -> simulatedPayInfo.setEmploymentInsurance(amount);
                        case "DDCT005" -> simulatedPayInfo.setIncomeTax(amount);
                        case "DDCT006" -> simulatedPayInfo.setResidentTax(amount);
                    }

                    if (amount != null) {
                        totalDeduction = totalDeduction.add(amount);
                    }

                } catch (Exception e) {
                    log.error("공제 계산 중 오류 발생 - {}: {}", formula.getFormulaCode(), e.getMessage());
                }
            }
            
            // 총 공제액 설정
            simulatedPayInfo.setDeducAmt(totalDeduction);
            
            // 실수령액 계산
            BigDecimal netSalary = new BigDecimal(baseSalary).subtract(totalDeduction);
            simulatedPayInfo.setNetSalary(netSalary);
            
            log.info("급여 시뮬레이션 완료 - 총공제액: {}, 실수령액: {}", totalDeduction, netSalary);
            
            return simulatedPayInfo;
            
        } catch (Exception e) {
            log.error("급여 시뮬레이션 중 오류 발생", e);
            throw new RuntimeException("급여 계산 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * null을 0으로 변환하는 유틸리티 메서드
     */
    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}