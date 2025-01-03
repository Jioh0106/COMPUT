package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
		return "/ex/form-element-input";
	}
	
	//http://localhost:8082/ps-list
	@GetMapping("/ps-list")
	public String psList() {
		
		return "/personnel/ps_list";
	}
	
	//http://localhost:8082/ps-reg
	@GetMapping("/ps-reg")
	public String psRegist() {
		
		return "/personnel/ps_insert";
	}
	
	@PostMapping("/ps-reg")
	public String psInsert(EmployeesDTO empDTO,
							@RequestParam("first_emp_ssn") String firstEmpSsn,
							@RequestParam("second_emp_ssn") String secEmpSsn) {
		
		// 받아온 주민등록번호 파라미터
		String fullEmpSsn = firstEmpSsn + "-" + secEmpSsn;
		empDTO.setEmp_ssn(fullEmpSsn);
		
		log.info(empDTO.toString());
		
		
		return "redirect:/ps-list";
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
