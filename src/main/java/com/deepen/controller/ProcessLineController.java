package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ProcessLineController {

	@GetMapping("/process-line-info")
	public String getProcessLineInfo() {
		
		return "info/process_line_info";
	}
}
