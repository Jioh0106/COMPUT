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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.RequestDTO;
import com.deepen.mapper.RequestMapper;
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
	@GetMapping("/list")
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
	
	//토스트알림 -> 최종승인 발령자 조회
	@GetMapping("/select/checked")
	public ResponseEntity<List<RequestDTO>> selectChecked(@AuthenticationPrincipal User user){
		String empId = user.getUsername();
		log.info("로그인한 사번은누구누구 :"+ empId);
	    List<RequestDTO> result = rqService.selectChecked(empId);
	    
	    return ResponseEntity.ok(result);
	}
	
	//토스트알림 -> X 누르면 is_checked컬럼 'Y'로 업데이트
	@PostMapping("/update/checked")
	public ResponseEntity<Void> updateChecked(@RequestParam("request_no") Integer request_no) {
	    rqService.updateChecked(request_no);
	    return ResponseEntity.ok().build();
	}
	
	
	
	
	
	
	
} // RequestRestController
