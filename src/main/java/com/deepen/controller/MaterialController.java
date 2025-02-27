package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.MaterialService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class MaterialController {
	
	/** 자재 서비스 */
	private final MaterialService service;
	
	/**
	 * 초기 화면
	 * @view 
	 * @return String
	 */
	@GetMapping("/material-info")
	public String MaterialInfo() {
		
		return "info/material_info";
		
	}

}
