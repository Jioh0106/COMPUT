package com.deepen.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.RequestDTO;
import com.deepen.entity.Request;
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
	
	
}
