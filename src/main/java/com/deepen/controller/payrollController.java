package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class payrollController {

	@GetMapping("pay-stts")
	public String payStts() {
		
		return "payroll/pay_stts";
	}
	
	@GetMapping("pay-stts-modal")
	public String paysttsModal() {
		
		return "payroll/pay_stts_modal";
	}
	
	@GetMapping("pay-list")
	public String payList() {
		
		return "payroll/pay_list";
	}
	
	@GetMapping("pay-list-modal")
	public String paylistModal() {
		
		return "payroll/pay_list_modal";
	}
	
}
