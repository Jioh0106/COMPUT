package com.deepen.controller;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.service.AttendanceService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class AttendanceController {
	
	private final AttendanceService attendanceService;
	
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
	
	// 휴직 관리
	@GetMapping("/loab-mng")
	public String absence(Model model) throws JsonProcessingException {
		//http://localhost:8082/loab-mng
		
		List<Map<String, Object>> absenceList = attendanceService.getAbsenceList();
		
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    absenceList.forEach(item -> {
	        Timestamp timestamp = (Timestamp) item.get("ABSENCE_START");
	        if (timestamp != null) {
	            LocalDateTime dateTime = timestamp.toLocalDateTime();
	            String formattedDate = dateTime.format(formatter);
	            item.put("ABSENCE_START", formattedDate);
	        }
	        Timestamp timestamp2 = (Timestamp) item.get("ABSENCE_END");
	        if (timestamp2 != null) {
	        	LocalDateTime dateTime = timestamp2.toLocalDateTime();
	        	String formattedDate = dateTime.format(formatter);
	        	item.put("ABSENCE_END", formattedDate);
	        }
	        Timestamp timestamp3 = (Timestamp) item.get("REQUEST_DATE");
	        if (timestamp3 != null) {
	        	LocalDateTime dateTime = timestamp3.toLocalDateTime();
	        	String formattedDate = dateTime.format(formatter);
	        	item.put("REQUEST_DATE", formattedDate);
	        }
	    });
	    
		log.info("absenceList : " + absenceList.toString());
		
		model.addAttribute("absenceList", absenceList);
		
		return "attendance/loab_mng";
	}
	
	
	@PostMapping("/loab-insert")
	public String laobInsert(String emp_id, String absence_start, String absence_end, String absence_type, String absence_remark ) {
		
		
		attendanceService.insertLoab();
		
		
		
		
		return "";
	}
	
	// 근무 관리
	@GetMapping("/work-mng")
	public String workMng() {
		//http://localhost:8082/work-mng
		return "attendance/work_mng";
	}
	
	
	
	
	
	
}
