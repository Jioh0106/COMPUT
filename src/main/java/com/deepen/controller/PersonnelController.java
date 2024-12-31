package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class PersonnelController {
	
	@GetMapping("/ex")
	public String exPage() {
		return "/ex/component-dropdown";
	}
	
//	@GetMapping("/ex2")
//	public String exPage2() {
//		return "/attendance/vctn_mng";
//	}
	

	@GetMapping("/ps-list")
	public String list() {
		
		return "/personnel/ps_list";
	}
	
	@GetMapping("/ps-insert")
	public String insert() {
		
		return "/personnel/ps_insert";
	}
	
}
