package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class PersonnelController {
	
	@GetMapping("/ex")
	public String exPage() {
		return "/ex/component-button";
	}
	
	//http://localhost:8082/ps-list
	@GetMapping("/ps-list")
	public String psList() {
		
		return "/personnel/ps_list";
	}
	
	//http://localhost:8082/ps-insert
	@GetMapping("/ps-insert")
	public String psInsert() {
		
		return "/personnel/ps_insert";
	}
	
	//http://localhost:8082/ps-empDb
	@GetMapping("/ps-empDb")
	public String empDb() {
		
		return "/personnel/ps_empDb";
	}
	
	//http://localhost:8082/ps-hrDb
	@GetMapping("/ps-hrDb")
	public String hrDb() {
		
		return "/personnel/ps_hrDb";
	}
	
}
