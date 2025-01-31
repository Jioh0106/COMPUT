package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.service.EquipmentInfoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class EquipmentInfoController {

	/** 설비 정보 서비스 */
	private final EquipmentInfoService service;

	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/equipment-info")
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
		
		// 현재 월 기준으로 설비 정보 목록 조회
		List<Map<String, Object>> equipmentList = service.equipmentInfo(searchMap);
		model.addAttribute("equipmentList", equipmentList);
		
		// 거래처 목록 조회
		List<Map<String, Object>> clientList = service.clientInfo();
		model.addAttribute("clientList", clientList);

		// 설비 종류 목록 조회
		List<Map<String, Object>> kindList = service.kindInfo();
		model.addAttribute("kindList", kindList);
		
		return "equipment/equipment_info";
	}
	
	/**
	 * 검색 조건 조회
	 * @param searchMap
	 * @return
	 */
	@PostMapping("/eqpSearchSelect")
	@ResponseBody
	public List<Map<String, Object>> eqpSearchSelect(@RequestBody Map<String, Object> searchMap) {

		List<Map<String, Object>> equipmentList = service.equipmentInfo(searchMap);

		return equipmentList;
	}
	
	/**
	 * 저장
	 * @param saveDataList
	 * @return int
	 */
	@PostMapping("/eqpSaveData")
	@ResponseBody
	public int eqpSaveData(@RequestBody List<Map<String, Object>> saveDataList) {

		int result = service.eqpSaveData(saveDataList);

		return result;
	}

	

}
