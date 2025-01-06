package com.deepen.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.entity.SalaryFormula;
import com.deepen.service.SalaryFormulaService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PayrollController {
    
    private final SalaryFormulaService salaryFormulaService;
    
    // 급여 종류 관리
    @GetMapping("/pay-mng")
    public String payMng(Model model) {
        List<SalaryFormula> formulas = salaryFormulaService.findAll();
        model.addAttribute("formulas", formulas);
        return "payroll/pay_mng";
    }
    
    // 급여 종류 저장
    @PostMapping("/pay-mng")
    public String payMngPro(SalaryFormulaDTO salaryFormulaDTO) {
    	salaryFormulaService.save(salaryFormulaDTO);
        return "redirect:/pay-mng";  // 저장 후 목록 페이지로 리다이렉트
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