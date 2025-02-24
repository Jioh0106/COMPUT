package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.service.ProductionHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/production")
@Log
public class ProductionHistoryRestController {
	
	private final ProductionHistoryService prdctService;
	
	//생산이력 
	@GetMapping("/history/{plan_id}")
	public List<Map<String, Object>> historyList(@PathVariable("plan_id") String plan_id){
		List<Map<String, Object>> list = prdctService.historyList(plan_id);
		log.info("클릭한 행의 list :"+list);
		log.info("클릭한 행의 생산계획번호 :"+ plan_id);
		
		return list;
	}
	
	
	
}
