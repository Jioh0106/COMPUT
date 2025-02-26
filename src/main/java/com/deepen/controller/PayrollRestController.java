package com.deepen.controller;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.deepen.PdfGenerator;
import com.deepen.domain.PayInfoDTO;
import com.deepen.entity.PayInfo;
import com.deepen.mapper.PayInfoMapper;
import com.deepen.repository.PayInfoRepository;
import com.deepen.domain.PayListDTO;
import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.service.SalaryFormulaService;
import com.deepen.service.PayInfoService;
import com.deepen.service.PayListService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/payroll")
@Log
public class PayrollRestController {
	
	private final SalaryFormulaService salaryFormulaService;
	private final PayInfoService payInfoService;
	private final PayListService payListService;
	private final PayInfoRepository payInfoRepository;
	private final PayInfoMapper payInfoMapper;
	private final TemplateEngine templateEngine;
	private final PdfGenerator pdfGenerator;

	// 급여 종류 관리 추가 POST
    @PostMapping("/pay-mng")
    @ResponseBody
    public ResponseEntity<?> saveFormula(@RequestBody SalaryFormulaDTO salaryFormulaDTO) {
    	try {
            salaryFormulaService.save(salaryFormulaDTO);
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "저장되었습니다.",
                    "status", "success"
                ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "저장 중 오류가 발생했습니다: " + e.getMessage(),
                    "status", "error"
                ));
        }
    }
	
 // 급여 종류 관리 수정
    @PostMapping("/pay-mng/update")
    @ResponseBody
    public ResponseEntity<?> updateFormula(@RequestBody SalaryFormulaDTO salaryFormulaDTO) {
    	 try {
             salaryFormulaService.update(salaryFormulaDTO);
             return ResponseEntity.ok()
                     .body(Map.of("message", "수정되었습니다."));
         } catch (Exception e) {
             return ResponseEntity.badRequest()
                     .body(Map.of("message", "수정 중 오류가 발생했습니다: " + e.getMessage()));
         }
    }
    
    
    // 급여 종류 관리 삭제
    @PostMapping("/pay-mng/delete")
    @ResponseBody
    public ResponseEntity<?> deleteFormulas(@RequestBody List<Long> ids) {
        try {
            salaryFormulaService.deleteByIds(ids);
            return ResponseEntity.ok()
                    .body(Map.of("message", "삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    @GetMapping("/pay-mng/formula-types")
    @ResponseBody
    public List<Map<String, String>> getFormulaTypes() {
        return salaryFormulaService.getFormulaTypes();
    }
    
    @GetMapping("/pay-mng/check-duplicate")
    @ResponseBody
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(
    		 @RequestParam("name") String name  // "name"으로 파라미터 이름 명시
	) {
	    try {
	        boolean isDuplicate = salaryFormulaService.existsByFormulaName(name);
	        return ResponseEntity.ok(Map.of("isDuplicate", isDuplicate));
	    } catch (Exception e) {
	        return ResponseEntity.badRequest()
	            .body(Map.of("isDuplicate", false));
	    }
	}
	
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
        }
		return null; 
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
    
    
    @GetMapping("/pay-info/missing")
    public ResponseEntity<?> getMissingPaymentEmployees(@RequestParam("paymentDate") String paymentDate) {
        List<Map<String, Object>> missingEmployees = payInfoService.getMissingPaymentEmployees(paymentDate);
        return ResponseEntity.ok(Map.of(                             
            "message", missingEmployees.isEmpty() ? 
                "해당 월의 모든 직원에게 급여가 지급되었습니다." : 
                String.format("%d명의 미지급 직원이 있습니다.", missingEmployees.size()),
            "data", missingEmployees
        ));
    }
    
    // 급여명세서 PDF 미리보기	
    @GetMapping("/pay-info/{paymentNo}/payslip/preview")
    public ResponseEntity<String> previewPayslip(
            @PathVariable("paymentNo") Long paymentNo,
            @RequestParam("empName") String empName) {
        try {
            // PayInfo 조회
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
            
            // templates/payroll/payslip.html 을 찾아서 처리
            String html = templateEngine.process("/payroll/payslip", context);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(html);
            
        } catch (Exception e) {
            log.severe("HTML 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating preview");
        }
    }
    
	// 급여명세서 PDF 다운로드
    @GetMapping("/pay-info/{paymentNo}/payslip/download")
    public ResponseEntity<ByteArrayResource> downloadPayslip(
            @PathVariable("paymentNo") Long paymentNo,
            @RequestParam("empName") String empName) {
        try {
            // PayInfo 조회
            PayInfo payInfo = payInfoRepository.findById(paymentNo)
                    .orElseThrow(() -> new IllegalArgumentException("해당 급여 정보가 없습니다."));
            
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
            
            // HTML을 PDF로 변환
            String html = templateEngine.process("/payroll/payslip", context);
            byte[] pdfBytes = pdfGenerator.generatePdf(html);
            
            // 응답 헤더 설정
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PreAuthorize("hasRole('ATHR001')")  
    @DeleteMapping("/pay-info")
    public ResponseEntity<?> deletePayInfo(@RequestBody List<Long> paymentNos) {
        try {
            payInfoService.deletePayInfo(paymentNos);
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "선택한 급여 정보가 삭제되었습니다.",
                    "status", "success"
                ));
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message", "삭제 중 오류가 발생했습니다: " + e.getMessage(),
                    "status", "error"
                ));
        }
    }

    //==============   급여 대장   =================== //
    
    // 월별 급여 대장 메인
    @GetMapping("/pay-list/summary")
    public List<PayListDTO> getMonthlyPayrollSummary(@RequestParam("keyword") String keyword){
     return payListService.getMonthlyPayrollSummary(null, keyword);
    }    
    
    //급여 대장 모달
    @GetMapping("/pay-list/detail")
    public List<PayListDTO> getMonthlyPayrollDetail(@RequestParam("paymentDate") String paymentDate){
    return payListService.getMonthlyPayrollDetail(paymentDate, "");
    }
    
    //연간 급여 대장 조회
    @GetMapping("/pay-list/annual/{year}")
    public List<PayListDTO> getAnnualPayroll(@RequestParam("year") String year) {
    return payListService.getAnnualPayrollData(year);
    }
    
}
