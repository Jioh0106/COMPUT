package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.deepen.domain.SalaryFormulaDTO;

@Controller
public class PayrollController {
	
	// 급여 종류 관리
	@GetMapping("/pay-mng")
	public String payMng() {
		//http://localhost:8082/pay-mng
		return "payroll/pay_mng";
	}
	
	@PostMapping("/pay-mng")
	public String payMng(SalaryFormulaDTO salaryFormulaDTO) {
		return "";
	}
	
	// 급여 지급 이력
	@GetMapping("/pay-stts")
	public String payStts() {
		//http://localhost:8082/pay-stts
		return "payroll/pay_stts";
	}
	
	// 급여 대장 관리
	@GetMapping("/pay-list")
	public String payList() {
		//http://localhost:8082/pay-list
		return "payroll/pay_list";
	}
	
	
	
	
	
	
	
}
