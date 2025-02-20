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
	
	//생산이력
	@GetMapping("prdct-history")
	public String proHistoryList(Model model) {
		
		List<Map<String, Object>> historyList = prdctService.historyList();
		model.addAttribute("historyList", historyList);
		
		return "production/prdct_history";
	}
	
	
	
}
