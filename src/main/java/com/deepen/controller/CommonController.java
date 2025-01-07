package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.deepen.service.CommonService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class CommonController {
	
	private final CommonService service;
	
	// 공통코드 관리
	@GetMapping("/common-mng")
	public String commonList(Model model) {
		//http://localhost:8082/common-mng
		
		List<Map<String, Object>> commonList = service.commonList();
		model.addAttribute("commonList", commonList);
		
		return "common/common_mng";
	}


}
