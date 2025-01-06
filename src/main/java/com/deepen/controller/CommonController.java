package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CommonController {
	
	// 공통코드 관리
	@GetMapping("/common-mng")
	public String cmtMng() {
		//http://localhost:8082/common-mng
		return "common/common_mng";
	}

}
