package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AttendanceController {
	
	@GetMapping("/leave-absence")
	public String leaveAbsence() {
		
		
		return "attendance/leave_absence";
	}
	
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
	
}
