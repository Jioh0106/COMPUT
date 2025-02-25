package com.deepen.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.domain.MaterialDTO;
import com.deepen.entity.Material;
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
	 * @view model
	 * @return String
	 */
	@GetMapping("/material-info")
	public String MaterialInfo() {
		
		return "info/material_info";
		
	}

}
