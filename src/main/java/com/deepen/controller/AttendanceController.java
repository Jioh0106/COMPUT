package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AttendanceController {
	
	@GetMapping("/leave-absence")
	public String leaveAbsence() {
		
		
		return "attendance/leave_absence";
	}
	
	@GetMapping("/cmt-mng")
	public String cmtMng() {
		//http://localhost:8082/cmt
		return "attendance/cmt_mng";
	}
	
	
}
