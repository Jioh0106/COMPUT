package com.deepen.controller;

import java.sql.Timestamp;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.EmployeesDTO;
import com.deepen.entity.Employees;
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
		
		return "/personnel/ps_list";
	}
	
	//http://localhost:8082/ps-reg
	@GetMapping("/ps-reg")
	public String psRegist() {
		
		return "/personnel/ps_insert";
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
		
		return "/personnel/registClose";
	}
	
	@PostMapping("/ps-update")
	public String psUpdate(@RequestParam("regDate") String regDateStr,EmployeesDTO dto) {
		
		 try {
		        // 문자열 -> Timestamp 변환
		        Timestamp regDate = Timestamp.valueOf(regDateStr.replace("T", " ").substring(0, 19));
		        dto.setEmp_reg_date(regDate);
		    } catch (IllegalArgumentException e) {
		        // 잘못된 날짜 포맷 처리
		        return "redirect:/error-page";
		    }
		 log.info("C-update : "+dto.toString());
		
		//psService.updateEmpInfo(dto);
		
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
