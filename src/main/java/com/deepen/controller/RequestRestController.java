package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.RequestDTO;
import com.deepen.service.RequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/request")
@Log
public class RequestRestController {
	
	private final RequestService rqService;
	
	
	//요청내역 전체 불러오기
	@GetMapping("/request-list")
    public List<RequestDTO> getRequestList(@AuthenticationPrincipal User user) {
		String emp_id = user.getUsername(); //로그인한 사원번호
		
		//로그인한 사원 요청내역 조회
		List<RequestDTO> allList = rqService.requestAllList(emp_id);
		log.info("요청내역전체리스트!!!"+allList.toString());
        return allList;
    }
	
	
	@PostMapping("/absence/update")
	public ResponseEntity<String> updateAbsenceRequest(@RequestBody Map<String, Object> updateData) {
		
		log.info("updateAbsenceRequest : "+ updateData.toString());
		
	    try {
	    	rqService.updateAbsenceRequest(updateData);
	        return ResponseEntity.ok("승인/반려 처리 완료");
	        
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업데이트 중 오류 발생");
	    }
		
		
	} // updateAbsenceRequest
	
	
} // RequestRestController
