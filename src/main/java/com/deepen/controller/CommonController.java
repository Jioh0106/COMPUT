package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.CommonDTO;
import com.deepen.service.CommonService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class CommonController {

	private final CommonService service;

	/**
	 * 공통코드 조회
	 * 
	 * @view model
	 * @return String
	 */
	@GetMapping("/common-mng")
	public String commonList(Model model) {
		// http://localhost:8082/common-mng

		List<Map<String, Object>> commonList = service.commonList();
		model.addAttribute("commonList", commonList);

		return "common/common_mng";
	}

	/**
	 * 상세공통코드 조회
	 * 
	 * @view model
	 * @param map
	 * @return List<Map<String, Object>>
	 */
	@PostMapping("/commonCd")
	@ResponseBody
	public List<Map<String, Object>> commonCd(Model model, @RequestBody Map<String, Object> map) {

		String commonCd = (String) map.get("celVal");

		List<Map<String, Object>> commonDtlList = service.commonDtlList(commonCd);
		model.addAttribute("commonDtlList", commonDtlList);

		return commonDtlList;

	}

	/**
	 * 공통코드 및 상세공통코드 저장
	 * 
	 * @param commonList
	 * @return
	 */
	@PostMapping("/saveData")
	@ResponseBody
	public int saveData(@RequestBody List<CommonDTO> commonList) {

		int result = service.saveData(commonList);

		return result;
	}

}
