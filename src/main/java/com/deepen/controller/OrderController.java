package com.deepen.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.domain.ClientDTO;
import com.deepen.entity.Client;
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
	 * @view 
	 * @return String
	 */
	@GetMapping("/prdct-order")
	public String prdctOrder() {
		
		return "production/prdct_order";
		
	}
	
	/**
	 * 수주 등록 팝업창
	 * @view model 
	 * @return String
	 */
	@GetMapping("/reg-sale")
	public String regSale(Model model) {
		
		return "production/reg_sale";
		
	}
	
	/**
	 * 발주 등록 팝업창
	 * @view model
	 * @return String
	 */
	@GetMapping("/reg-buy")
	public String regBuy(Model model) {
		
		return "production/reg_buy";
		
	}
	
	
	

} // PrdctPlanController
