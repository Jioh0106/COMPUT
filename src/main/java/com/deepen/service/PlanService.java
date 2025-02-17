package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.OrdersDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.PlansRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class PlanService {
	
	private final PlansMapper mapper;
	private final PlansRepository repository;
	
	public List<PlansDTO> getPlanList() {
		return mapper.getPlanList();
	}
	
	public List<OrdersDTO> getPlanSerchList(Map<String, String> map) {
		// TODO Auto-generated method stub
		return null;
	}
	
	
	
	
	
	
	
	

} // PrdctPlanService
