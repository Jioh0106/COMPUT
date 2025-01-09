package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class AttendanceController {
	
	
	// 출퇴근 현황
	@GetMapping("/cmt-stts")
	public String cmtMng() {
		//http://localhost:8082/cmt-stts
		return "attendance/cmt_stts";
	}
	
	//휴가 관리
	@GetMapping("/vctn-mng")
	public String vctnMng() {
		//http://localhost:8082/vctn-mng
		return "attendance/vctn_mng";
	}
	
	
	
	// 근무 관리
	@GetMapping("/work-mng")
	public String workMng() {
		//http://localhost:8082/work-mng
		return "attendance/work_mng";
	}
	
	
	
	
	
	
}