package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RequestController {
	
	//요청내역 리스트 페이지
	@GetMapping("/request-list")
	public String requestList() {
		//http://localhost:8082/request-list
		
		return"request/request_list";
	}
	
	//요청상세내용 페이지
	@GetMapping("/request-assign-detail")
	public String requestAssignDetail() {
		//http://localhost:8082/request-assign-detail
		
		return"request/request_assign_detail";
	}

}
