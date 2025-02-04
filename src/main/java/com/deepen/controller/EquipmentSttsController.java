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

import com.deepen.service.EquipmentSttsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class EquipmentSttsController {

	/** 설비 현황 서비스 */
	private final EquipmentSttsService service;

	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/equipment-stts")
	public String equipmentStts(Model model) {
		// http://localhost:8082/equipment-stts

		// 설비 상태 목록 조회
		List<Map<String, Object>> sttsList = service.selectStts();
		model.addAttribute("sttsList", sttsList);
		
		// 설비 목록 조회
		Map<String, Object> searchMap = new HashMap<>();
		List<Map<String, Object>> equipmentList = service.selectEquipmentStts(searchMap);
		model.addAttribute("equipmentList", equipmentList);
		
		return "equipment/equipment_stts";
	}
	
	/**
	 * 검색 조건 조회
	 * @param searchMap
	 * @return
	 */
	@PostMapping("/selectEqpSearch")
	@ResponseBody
	public List<Map<String, Object>> selectEqpSearch(@RequestBody Map<String, Object> searchMap) {

		List<Map<String, Object>> equipmentList = service.selectEquipmentStts(searchMap);
		// 상태에 대한 파라미터 값 출력 형태 [USST001, USST002]

		return equipmentList;
	}


}
