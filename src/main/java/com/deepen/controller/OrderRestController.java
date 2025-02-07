package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.OrdersDTO;
import com.deepen.domain.WorkDTO;
import com.deepen.entity.Orders;
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
	
	/** 주문관리 목록 조회 **/
	@GetMapping("/list")
	public ResponseEntity<List<OrdersDTO>> getWorkList(@RequestParam("date") String date, 
													@AuthenticationPrincipal User user) {
		
		String emp_id = user.getUsername();
		
		Map<String, String> map = new HashMap<>();
		map.put("emp_id", emp_id);
		map.put("date", date);
		
		List<OrdersDTO> list = service.getOrdersList(map);
		
		return ResponseEntity.ok(list);
        
	}
	
	/** 주문관리 그리드 정보 저장 **/
	
	
	/** 주문관리 그리드 정보 삭제 **/
	
	
	
} // PlanRestController