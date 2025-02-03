package com.deepen.controller;

import org.springframework.stereotype.Controller;

import ch.qos.logback.core.model.Model;

@Controller
public class QuailtyRestController {

	public String qualityInfo(Model model) {
		return "quality/quality_info";
	}
}
