package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.WorkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class WorkController {
	
	private final WorkService workService;
	
	
	// 근무 관리
	@GetMapping("/work-mng")
	public String workMng() {
		//http://localhost:8082/work-mng
		
		return "attendance/work_mng";
	}
	

	
	

}