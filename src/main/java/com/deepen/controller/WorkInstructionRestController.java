package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.service.WorkInstructionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequiredArgsConstructor
@Log
public class WorkInstructionRestController {
	
	private final WorkInstructionService wiService;

	@GetMapping("/process-info")
	public List<ProcessInfoDTO> getProcessInfo() {
		// selectbox에 넣을 공정 정보
		return wiService.getProcessList();
	}
	
	@GetMapping("/line-info")
	public List<LineInfoDTO> getLineInfo() {
		// selectbox에 넣을 라인 정보
		return wiService.getLineList();
	}
	
	
}
