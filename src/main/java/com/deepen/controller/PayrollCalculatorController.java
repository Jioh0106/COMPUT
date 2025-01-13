package com.deepen.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.PayInfoDTO;
import com.deepen.service.PayrollCalculatorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/payroll/calculator")
@RequiredArgsConstructor
public class PayrollCalculatorController {

    private final PayrollCalculatorService calculatorService;

    /**
     * 단일 직원 급여 계산
     * JSON 형식의 급여 계산식을 기반으로 계산 수행
     */
    @PostMapping("/calculate")
    public ResponseEntity<?> calculateSalary(@RequestBody Map<String, String> request) {
        try {
            // 1. 입력값 검증
            String empId = request.get("empId");
            String paymentDate = request.get("paymentDate");
            
            if (empId == null || paymentDate == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", "사원번호와 지급월은 필수입니다.",
                        "status", "error"
                    ));
            }
            
            // 2. 급여 계산 실행
            PayInfoDTO result = calculatorService.calculateSalary(empId, paymentDate);
            
            // 3. 결과 반환
            return ResponseEntity.ok()
                .body(Map.of(
                    "data", result,
                    "message", "급여 계산이 완료되었습니다.",
                    "status", "success"
                ));
            
        } catch (Exception e) {
            log.error("급여 계산 중 오류 발생 - empId: {}, error: {}", 
                request.get("empId"), e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "급여 계산 중 오류가 발생했습니다: " + e.getMessage(),
                    "status", "error"
                ));
        }
    }

    /**
     * 다중 직원 급여 일괄 계산
     * 여러 직원의 급여를 한 번에 계산
     */
    @PostMapping("/calculate-bulk")
    public ResponseEntity<?> calculateBulkSalary(@RequestBody List<Map<String, String>> requests) {
        log.info("다중 직원 급여 계산 시작 - 요청 건수: {}", requests.size());
        
        List<PayInfoDTO> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        
        for (Map<String, String> request : requests) {
            try {
                // 1. 입력값 검증
                String empId = request.get("empId");
                String paymentDate = request.get("paymentDate");
                
                if (empId == null || paymentDate == null) {
                    String error = String.format("사원번호와 지급월은 필수입니다. (empId: %s)", empId);
                    log.warn(error);
                    errors.add(error);
                    continue;
                }
                
                // 2. 급여 계산 실행
                PayInfoDTO result = calculatorService.calculateSalary(empId, paymentDate);
                results.add(result);
                successCount++;
                
            } catch (Exception e) {
                String error = String.format("사원 %s의 급여 계산 중 오류: %s", 
                    request.get("empId"), e.getMessage());
                log.error(error);
                errors.add(error);
            }
        }
        
        // 3. 일괄 처리 결과 반환
        String message;
        String status;
        
        if (successCount == 0) {
            message = "모든 급여 계산이 실패했습니다.";
            status = "error";
        } else if (errors.isEmpty()) {
            message = String.format("총 %d건의 급여 계산이 완료되었습니다.", successCount);
            status = "success";
        } else {
            message = String.format("총 %d건 중 %d건 성공, %d건 실패했습니다.", 
                requests.size(), successCount, errors.size());
            status = "partial";
        }
        
        log.info("다중 직원 급여 계산 완료 - 성공: {}, 실패: {}", successCount, errors.size());
        
        return ResponseEntity.ok()
            .body(Map.of(
                "data", results,
                "errors", errors,
                "message", message,
                "status", status,
                "totalCount", requests.size(),
                "successCount", successCount,
                "failureCount", errors.size()
            ));
    }
    
    /**
     * 급여 계산 테스트
     */
    @PostMapping("/test-calculate")
    public ResponseEntity<?> testCalculateSalary(@RequestBody Map<String, String> request) {
        try {
            String empId = request.get("empId");
            String paymentDate = request.get("paymentDate");
            
            if (empId == null || paymentDate == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", "사원번호와 지급월은 필수입니다.",
                        "status", "error"
                    ));
            }
            
            Map<String, Object> result = calculatorService.testCalculateSalary(empId, paymentDate);
            
            if ((boolean) result.get("success")) {
                return ResponseEntity.ok()
                    .body(Map.of(
                        "data", result,
                        "message", "급여 계산 테스트가 완료되었습니다.",
                        "status", "success"
                    ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", result.get("error"),
                        "status", "error"
                    ));
            }
            
        } catch (Exception e) {
            log.error("급여 계산 테스트 중 오류 발생", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "급여 계산 중 오류가 발생했습니다: " + e.getMessage(),
                    "status", "error"
                ));
        }
    }
}