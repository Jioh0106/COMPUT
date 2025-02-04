package com.deepen.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/order")
@Log
public class OrderRestController {
	
	/** 주문관리 서비스 */
	private final OrderService service;
	
	
	/** 주문관리 그리드 정보 저장 **/
	
	
	/** 주문관리 그리드 정보 삭제 **/
	
	
	
} // PlanRestController