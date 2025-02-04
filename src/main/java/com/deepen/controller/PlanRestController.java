package com.deepen.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.service.PlanService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/plan")
@Log
public class PlanRestController {
	
	/** 생산계획 서비스 */
	private final PlanService service;
	
	
	/** 생산계획 그리드 정보 저장 **/
	
	
	/** 생산계획 그리드 정보 삭제 **/
	
	
	
} // PlanRestController