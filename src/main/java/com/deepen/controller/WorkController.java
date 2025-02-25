package com.deepen.controller;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.entity.Employees;
import com.deepen.entity.WorkTmp;
import com.deepen.service.WorkService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class WorkController {
	
	private final WorkService workService;
	
	// 근무 관리
	@GetMapping("/work-mng")
	public String workMng(@AuthenticationPrincipal User user, HttpServletRequest request, Model model) {
		//http://localhost:8082/work-mng
		
		String emp_id = user.getUsername();
		
		Collection<GrantedAuthority> authorities = user.getAuthorities();
		String emp_role = authorities.iterator().next().getAuthority().replace("ROLE_", "");
		log.info("emp_role : " + emp_role);
		
		// 사용자 정보 조회
		Optional<Employees> emp = workService.findById(emp_id);
		model.addAttribute("emp", emp.get());
		
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
	    model.addAttribute("_csrf", csrfToken);
		
		return "attendance/work_mng";
	}
	
	// 근무 일정 추가(팝업창)
	@GetMapping("/work-add")
	public String workAdd(@AuthenticationPrincipal User user, HttpServletRequest request, Model model) {
		//http://localhost:8082/work-add
		
		String emp_id = user.getUsername();
		Collection<GrantedAuthority> authorities = user.getAuthorities();
		String emp_role = authorities.iterator().next().getAuthority().replace("ROLE_", "");
		
		log.info("emp_role : " + emp_role);
		
		// 사용자 정보 조회
		Optional<Employees> emp = workService.findById(emp_id);
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
		List<WorkTmp> tmpList = workService.tmpFindAll();
	    
		model.addAttribute("emp", emp.get());
		model.addAttribute("_csrf", csrfToken);
		model.addAttribute("tmpList", tmpList);
		
		return "attendance/work_add";
	}
	
	// 근무 템플릿 관리(팝업창)
	@GetMapping("/work-tmp")
	public String workTmp() {
		//http://localhost:8082/work-tmp
		return "attendance/work_tmp";
	}

	
	
	

}