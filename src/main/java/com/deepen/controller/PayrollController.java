package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PayrollController {
	
	// 출퇴근 현황
	@GetMapping("/pay-mng")
	public String payMng() {
		//http://localhost:8082/pay-mng
		return "payroll/pay_mng";
	}
	
	
	
	
	
	
}
