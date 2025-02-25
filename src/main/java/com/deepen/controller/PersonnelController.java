package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.deepen.domain.EmployeesDTO;
import com.deepen.service.PersonnelService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;


@RequiredArgsConstructor
@Controller
@Log
public class PersonnelController {
	
	private final PersonnelService psService; 
	
	//http://localhost:8082/ex
	@GetMapping("/ex")
	public String exPage() {
		return "/ex/component-button";
	}
	
	//http://localhost:8082/ps-list
	@GetMapping("/ps-list")
	public String psList() {
		
		return "personnel/ps_list";
	}
	
	//http://localhost:8082/ps-reg
	@GetMapping("/ps-reg")
	public String psRegist() {
		
		return "personnel/ps_insert";
	}
	
	@PostMapping("/ps-reg")
	public String psInsert(EmployeesDTO empDTO) {
		
		log.info(empDTO.toString());
		
		psService.regEmployees(empDTO);
		
		return "redirect:/registClose";
	}
	
	// 페이지 이동 후 팝업창 닫기용 페이지
	@GetMapping("/registClose")
	public String registClose() {
		
		return "personnel/registClose";
	}
	
	@PostMapping("/ps-update")
	public String psUpdate(EmployeesDTO empDTO) {
		
		log.info("C-update : "+empDTO.toString());
		
		psService.updateEmpInfo(empDTO);
		
		return "redirect:/ps-list";
	}
	
	//http://localhost:8082/ps-empDb
	@GetMapping("/ps-empDb")
	public String empDb() {
		
		return "personnel/ps_empDb";
	}
	
	//http://localhost:8082/ps-hrDb
	@GetMapping("/ps-hrDb")
	public String hrDb() {
		
		return "personnel/ps_hrDb";
	}
	
}
