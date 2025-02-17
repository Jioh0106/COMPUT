package com.deepen.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.BomDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.PlansRepository;

import jakarta.transaction.Transactional;
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
	
	@Transactional
	public List<SaleDTO> getRegPlanList() {
		List<SaleDTO> saleList = mapper.getRegPlanList();
		int time_sum = 0;
		
		for(SaleDTO sale : saleList) {
			List<Map<String, Object>> bomList = mapper.getUseBoMList(sale.getProduct_no());
			System.out.println("bomList = " + bomList);
			time_sum = 0;
			
			for(Map<String, Object> map : bomList) {
				int sum = mapper.sumProcessTime((String) map.get("PROCESS_NAME"));
				time_sum += sum;
			}
			
			sale.setTime_sum(time_sum * sale.getSale_vol());
		}
		
		return saleList;
	}
	
	@Transactional
	public boolean checkMtr(int product_no, int sale_vol) {
		// 최종 반환할 값(재고 있음/없음)
		boolean isMtr = true;
		
		// 현재 재고 
		List<Map<String, Integer>> inventory = mapper.getInventort();
		
		//재고 검사할 상품의 bom 목록
		List<Map<String, Object>> bomList = mapper.getUseBoMList(product_no);
		System.out.println("bomList = " + bomList);
		
		// 재고에서 사용될 예정인 생산계획에 등록된 수주 건의 bom 목록
		
		
		
		
		for(Map<String, Object> map : bomList) {
			
			
			
		}
		
		System.out.println("isMtr = " + isMtr);
		return isMtr;
	}
	
	
	
	
	
	
	
	

} // PrdctPlanService
