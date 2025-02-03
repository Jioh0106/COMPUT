package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import ch.qos.logback.core.model.Model;

@Controller
public class QuailtyController {

	// 품질 관리
	@GetMapping("/quality-info")
	public String qualityInfo(Model model) {
		return "info/quality_info";
	}
}
