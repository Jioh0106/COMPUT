package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.WorkInstructionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;


@Controller
@RequiredArgsConstructor
@Log
public class WorkInstructionController {
	
	private final WorkInstructionService wiService;

	@GetMapping("/work-instruction")
	public String workInstruction(Model model) {
			
		List<Map<String, Object>> workerList =  wiService.getWorkerListByPosition();
		log.info(workerList.toString());
		
		model.addAttribute("workerList", workerList);
		
		return "process/work_instruction";
	}
	
}
