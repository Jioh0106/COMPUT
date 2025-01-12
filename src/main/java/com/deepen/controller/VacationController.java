package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.CommuteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class VacationController {

	private final CommuteService service;

	// 휴가 관리
	@GetMapping("/vctn-mng")
	public String vctnMng() {
		// http://localhost:8082/vctn-mng
		return "attendance/vctn_mng";
	}
	
	// 휴가 신청서
	@GetMapping("/vctn-appform")
	public String insertVctn() {
		// http://localhost:8082/vctn-mng
		return "attendance/vctn_appform";
	}

}