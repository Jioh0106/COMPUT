package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class ProductionHistoryController {
	
	@GetMapping("production-history")
	public String proHistoryList() {
		return "production/prdct_history";
	}
	
	
	
}
