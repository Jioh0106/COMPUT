package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.SalaryFormula;
import com.deepen.service.SalaryFormulaService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PayrollController {

    private final SalaryFormulaService salaryFormulaService;

    @GetMapping("/pay-mng")
    public String payMng(Model model) {
        List<SalaryFormula> formulas = salaryFormulaService.findAll();
        model.addAttribute("formulas", formulas);
        return "payroll/pay_mng";
    }

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
    
    // 급여 지급 이력
    @GetMapping("/pay-stts")
    public String payStts() {
        return "payroll/pay_stts";
    }
    
    // 급여 대장 관리
    @GetMapping("/pay-list")
    public String payList() {
        return "payroll/pay_list";
    }
}