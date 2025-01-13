package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.VacationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class VacationController {

	private final VacationService service;

	// 휴가 관리
	@GetMapping("/vctn-mng")
	public String vctnMng(Model model) {
		// http://localhost:8082/vctn-mng

		return "attendance/vctn_mng";
	}

	// 휴가 신청서
	@GetMapping("/vctn-appform")
	public String insertVctn(Model model) {
		// http://localhost:8082/vctn-appform

		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 정보 조회
		Map<String, Object> empInfo = service.selectEmpInfo(userId);
		model.addAttribute("empInfo", empInfo);

		// 휴가 종류 조회
		List<Map<String, Object>> commonDtlList = service.selectCommonDtl();
		model.addAttribute("commonDtlList", commonDtlList);

		// 중간승인권자 조회
		List<Map<String, Object>> middleAprvr = service.selectMiddleAprvr();
		model.addAttribute("middleAprvr", middleAprvr);
		System.out.println(middleAprvr.toString());

		return "attendance/vctn_appform";
	}

}