package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.PayInfoDTO;
import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.SalaryFormula;
import com.deepen.service.PayInfoService;
import com.deepen.service.SalaryFormulaService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PayrollController {


    private final SalaryFormulaService salaryFormulaService;
    private final PayInfoService payInfoService;
    
    // 급여 종류 관리 추가 GET
    @GetMapping("/pay-mng")
    public String payMng(Model model) {
        List<SalaryFormula> formulas = salaryFormulaService.findAll();
        model.addAttribute("formulas", formulas);
        return "payroll/pay_mng";
    }

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

    // 급여 지급 이력
    @GetMapping("/pay-info")
    public String payrollMain(Model model) {
        List<PayInfoDTO> payInfoList = payInfoService.getAllPayInfo();
        model.addAttribute("payInfoList", payInfoList);
        System.out.println(payInfoList);
        return "payroll/pay_info";
    }
    
    // 급여 대장 관리
    @GetMapping("/pay-list")
    public String payList() {
        return "payroll/pay_list";
    }

}