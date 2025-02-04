package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class OrderController {
	
	/** 주문관리 서비스 */
	private final OrderService service;
	
	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/prdct-order")
	public String prdctOrder(Model model) {
		
		return "production/prdct_order";
		
	}
	
	
	

} // PrdctPlanController
