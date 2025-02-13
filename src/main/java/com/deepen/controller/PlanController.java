package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.PlanService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class PlanController {
	
	/** 거래처 서비스 */
	private final PlanService service;
	
	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/prdct-plan")
	public String prdctPlan(Model model) {
		
		return "production/prdct_plan";
		
	}
	
	
	
	
	
	

} // PrdctPlanController
