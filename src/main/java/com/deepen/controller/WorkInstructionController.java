package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class WorkInstructionController {

	@GetMapping("/work-instruction")
	public String workInstruction() {
		
		return "process/work_instruction";
	}
	
}
