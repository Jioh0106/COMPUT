package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.OrdersDTO;
import com.deepen.mapper.OrdersMapper;
import com.deepen.mapper.WorkMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class OrderService {
	
	private final OrdersMapper mapper;
	
	/** 주문관리 그리드 정보 조회 **/
	public List<OrdersDTO> getOrdersList(Map<String, String> map) {
		
		
		return mapper.getOrdersList();
	}
	
	
	
	
	
	
	
	

} // PrdctPlanService
