package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AssignController {
	
	//인사발령등록 페이지
	@GetMapping("/assign-insert")
	public String assignInsert() {
		//http://localhost:8082/assign_insert
		
		return "assign/assign_insert";
	}

}
