package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.service.EquipmentHstryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class EquipmentHstryController {

	/** 설비 이력 서비스 */
	private final EquipmentHstryService service;

	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/equipment-hstry")
	public String equipmentInfo(Model model) {
		// http://localhost:8082/equipment-info
		
		// 페이지 진입 시 검색 조건을 고정으로 뿌려 줄 년-월 목록
		List<Map<String, Object>> yearMonthList = service.yearMonthList();
		model.addAttribute("yearMonthList", yearMonthList);
		model.addAttribute("selectedYearMonth", yearMonthList.get(0).get("yearMonth"));

		// 검색 조건 map
		Map<String, Object> searchMap = new HashMap<>();
		
		// 검색 조건 map에 현재 월 삽입
		// (yearMonthList 내림차순으로 정렬했기 때문에 현재 날짜는 0번째)
		searchMap.put("yearMonth", yearMonthList.get(0).get("yearMonth"));
		
		// 설비 상태 목록 조회
		List<Map<String, Object>> sttsList = service.selectStts();
		model.addAttribute("sttsList", sttsList);
		
		// 등록된 설비 목록 조회
		List<Map<String, Object>> infoList = service.equipmentInfo(searchMap);
		model.addAttribute("infoList", infoList);
		
		// 이력 목록 조회
		List<Map<String, Object>> hstryList = service.equipmentHstry(searchMap);
		model.addAttribute("hstryList", hstryList);
		
		
		return "equipment/equipment_hstry";
	}
	
	/**
	 * 검색 조건 조회
	 * @param searchMap
	 * @return List
	 */
	@PostMapping("/eqpHstrySearchSelect")
	@ResponseBody
	public List<Map<String, Object>> eqpSearchSelect(@RequestBody Map<String, Object> searchMap) {

		List<Map<String, Object>> equipmentList = service.equipmentHstry(searchMap);

		return equipmentList;
	}
	
	/**
	 * 저장
	 * @param saveDataList
	 * @return int
	 */
	@PostMapping("/eqpHstrySaveData")
	@ResponseBody
	public int saveData(@AuthenticationPrincipal User user, @RequestBody List<Map<String, Object>> saveDataList) {

		int result = service.saveData(user, saveDataList);

		return result;
	}


}
