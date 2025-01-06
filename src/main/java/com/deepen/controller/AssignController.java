package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AssignController {
	
	//인사발령등록 페이지
	@GetMapping("/assign-insert")
	public String assignInsert() {
		//http://localhost:8082/assign-insert
		
		return "personnel/assign_insert";
	}
	
	//인사발령현황 페이지
	@GetMapping("/assign-stts")
	public String assignStts() {
		//http://localhost:8082/assign-stts
		
		return "personnel/assign_stts";
	}

}
