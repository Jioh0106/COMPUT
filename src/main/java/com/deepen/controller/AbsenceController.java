package com.deepen.controller;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.EmployeesDTO;
import com.deepen.entity.Employees;
import com.deepen.service.AbsenceService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class AbsenceController {
	
	private final AbsenceService absenceService;
	
	// 휴직 관리
	@GetMapping("/loab-mng")
	public String absence(Model model, @AuthenticationPrincipal User user) throws JsonProcessingException {
		//http://localhost:8082/loab-mng
		
		log.info("user.getUsername() : " + user.getUsername());
		String emp_id = user.getUsername();
		
		Optional<Employees> emp = absenceService.findById(emp_id);
		
		List<Map<String, Object>> absenceList = absenceService.getAbsenceList();
		
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
		
		model.addAttribute("emp", emp.get());
		model.addAttribute("absenceList", absenceList);
		
		return "attendance/loab_mng";
	}
	
	
	@PostMapping("/loab-insert")
	public String loabInsert( @RequestParam("emp_id") String emp_id,
						    @RequestParam("absence_start") String absence_start,
						    @RequestParam("absence_end") String absence_end,
						    @RequestParam("absence_type") String absence_type,
						    @RequestParam("absence_remark") String absence_remark,
						    @RequestParam("request_approval") String request_approval,
						    @RequestParam("request_role") String request_role,
						    @RequestParam("request_deadline") int request_deadline,
						    Model model) {
	
		
		log.info("loabInsert - request_role : " + request_role);
		
		Map<String, Object> map = new HashMap<>();
		
		map.put("emp_id", emp_id);
		map.put("absence_start", absence_start);
		map.put("absence_end", absence_end);
		map.put("absence_type", absence_type);
		map.put("absence_remark", absence_remark);
		map.put("request_type", "휴직");
		map.put("request_approval", request_approval);
		map.put("request_role", request_role);
		map.put("request_deadline", request_deadline);
		map.put("request_date", new Timestamp(System.currentTimeMillis()));
		
		log.info("loabInsert - map : " + map.toString());
		
		absenceService.insertRequest(map);
		
		
		return "redirect:/loab-mng";
		
		
	}
	
	
	
	

}