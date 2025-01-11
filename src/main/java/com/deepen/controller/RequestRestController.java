package com.deepen.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.entity.Request;
import com.deepen.service.RequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/requestApi")
@Log
public class RequestRestController {
	
	private final RequestService rqService;
	
	
	//요청내역 전체 불러오기
	@GetMapping("/request-list")
    public List<Request> getRequestList() {
		List<Request> allList = rqService.requestAllList();
		log.info("요청내역전체리스트!!!"+allList.toString());
        return allList;
    }
	
	
}
