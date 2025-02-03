package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class QualityController {

	// 품질 관리
	@GetMapping("/quality-info")
	public String qualityInfo(Model model) {
		return "info/quality_info";
	}
}
