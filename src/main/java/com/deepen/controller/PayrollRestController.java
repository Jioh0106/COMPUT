package com.deepen.controller;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.deepen.PdfGenerator;
import com.deepen.domain.PayInfoDTO;
import com.deepen.entity.PayInfo;
import com.deepen.mapper.PayInfoMapper;
import com.deepen.repository.PayInfoRepository;
import com.deepen.domain.PayListDTO;
import com.deepen.service.PayInfoService;
import com.deepen.service.PayListService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/payroll")
@Log
public class PayrollRestController {
	
	private final PayInfoService payInfoService;
	private final PayInfoRepository payInfoRepository;
	private final PayInfoMapper payInfoMapper;
	private final TemplateEngine templateEngine;
  private final PdfGenerator pdfGenerator;
	private final PayListService payListService;

	 //급여 지급 이력 저장
    @PostMapping("/pay-info/save")
    public ResponseEntity<?> savePayInfo(@RequestBody List<PayInfoDTO> payInfoDTOList) {
        if (payInfoDTOList == null || payInfoDTOList.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "저장할 데이터가 없습니다.",
                    "status", "error"
                ));
        }

        Map<String, Object> result = payInfoService.savePayInfo(payInfoDTOList);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "저장되었습니다.",
                    "status", "success"
                ));
        } else {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", String.join("\n", (List<String>) result.get("errors")),
                    "status", "error"
                ));
        }
    }

    //급여 지급 이력 - 부서 목록
    @GetMapping("/pay-info/departments")
    public ResponseEntity<?> getDepartments() {
        List<Map<String, String>> departments = payInfoService.getDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/pay-info/search")
    public ResponseEntity<?> searchPayInfo(
        @RequestParam(value = "department", required = false, defaultValue = "") String department,
        @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
        @RequestParam(value = "searchType", required = false, defaultValue = "main") String searchType) {
        
        try {
            // 현재 로그인한 사용자의 권한 확인
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
            String currentEmpId = auth.getName();
            
            // 권한 체크
            boolean isRegularEmployee = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ATHR003"));
            
            List<PayInfoDTO> results;
            
            if (isRegularEmployee) {
                // 일반 사원인 경우 자신의 급여 정보만 조회
                results = payInfoService.getEmployeePayInfo(currentEmpId);
            } else {
                // 관리자인 경우 검색 조건에 따른 조회
                results = "modal".equals(searchType) 
                    ? payInfoService.searchEmployees(department, keyword)
                    : payInfoService.searchPayInfo(department, keyword);
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "검색 중 오류가 발생했습니다: " + e.getMessage(),
                    "status", "error"
                ));
        }
    }
    
    
    //특정 월의 급여 미지급 직원 목록
    @GetMapping("/pay-info/missing")
    public ResponseEntity<?> getMissingPaymentEmployees(@RequestParam("paymentDate") String paymentDate) {
        try {
            List<Map<String, Object>> missingEmployees = payInfoService.getMissingPaymentEmployees(paymentDate);
                
            Map<String, Object> response = new HashMap<>();
            response.put("message", missingEmployees.isEmpty() ? 
                "해당 월의 모든 직원에게 급여가 지급되었습니다." : 
                String.format("%d명의 미지급 직원이 있습니다.", missingEmployees.size()));
            response.put("data", missingEmployees);
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "조회 중 오류가 발생했습니다."));
        }
    }
    
 // 급여명세서 PDF 다운로드
    @GetMapping("/pay-info/{paymentNo}/payslip")
    public ResponseEntity<ByteArrayResource> downloadPayslip(
            @PathVariable("paymentNo") Long paymentNo,
            @RequestParam("empName") String empName) {
        try {
            // PayInfo 조회 (기존 코드 유지)
            PayInfo payInfo = payInfoRepository.findById(paymentNo)
                    .orElseThrow(() -> new IllegalArgumentException("해당 급여 정보가 없습니다. paymentNo=" + paymentNo));
            
            // PayInfoDTO로 변환하여 부서/직급 정보 포함
            PayInfoDTO payInfoDTO = payInfoMapper.getAllPayInfo().stream()
                    .filter(dto -> dto.getPaymentNo().equals(paymentNo))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("해당 급여 정보를 찾을 수 없습니다."));
            
            // Context 설정
            Context context = new Context();
            context.setVariable("payInfo", payInfo);
            context.setVariable("empName", empName);
            context.setVariable("departmentName", payInfoDTO.getDepartmentName());
            context.setVariable("positionName", payInfoDTO.getPositionName());
            
            // PDF 생성
            String html = templateEngine.process("payslip", context);
            byte[] pdfBytes = pdfGenerator.generatePdf(html);
            
            // 응답 생성
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename(payInfo.getEmpId() + "_" + payInfo.getPaymentDate() + "_급여명세서.pdf", StandardCharsets.UTF_8)
                    .build());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(new ByteArrayResource(pdfBytes));
            
        } catch (Exception e) {
            log.severe("PDF 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace(); // 개발 중에는 상세 로그 확인용
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
    //==============   급여 대장 이력  ===================
    
    // 월별 급여 대장 메인
    @GetMapping("/pay-list/summary")
    public ResponseEntity<?> getMonthlyPayrollSummary(
        @RequestParam(name = "keyword", required = false) String keyword
    ) {
        try {
            log.info("REST Controller - Received search request with keyword: " + keyword);
            List<PayListDTO> summary = payListService.getMonthlyPayrollSummary(null, keyword);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.severe("Error in getMonthlyPayrollSummary: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", "조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    //급여 대장 모달
    @GetMapping("/pay-list/detail")
    public ResponseEntity<?> getMonthlyPayrollDetail(
        @RequestParam(name = "paymentDate") String paymentDate
    ) {
        try {
            List<PayListDTO> detail = payListService.getMonthlyPayrollDetail(paymentDate, null);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            log.severe("Error in getMonthlyPayrollDetail: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", "상세 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
