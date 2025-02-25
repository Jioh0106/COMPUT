package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.ProductionHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class ProductionHistoryController {
	
	private final ProductionHistoryService prdctService;
	
	//생산이력 모달창
	@GetMapping("prdct-history")
	public String proHistoryList(Model model) {
		
		//생산이력 조회
		//List<Map<String, Object>> historyList = prdctService.historyList();
		//model.addAttribute("historyList", historyList);
		
		//생산계획번호 조회
		List<Map<String, Object>> planIdList = prdctService.selectPlanId();
		model.addAttribute("planIdList", planIdList);
		log.info("생산계획테이블 :"+ planIdList);
		
		return "production/prdct_history";
	}
	
	
	
	
	
}
