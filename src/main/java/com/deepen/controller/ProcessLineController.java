package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.service.ProcessLineService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class ProcessLineController {
	
	private final ProcessLineService plService;

	@GetMapping("/process-line-info")
	public String getProcessLineInfo(Model model) {
		
		List<Map<String, Object>> processList = plService.processInfo(null);
		List<Map<String, Object>> lineList = plService.lineInfo(null);
		
		model.addAttribute("processList", processList);
		model.addAttribute("lineList", lineList);
		
		return "info/process_line_info";
	}
	
	/**
	 * 검색 조건 조회
	 * @param searchMap
	 * @return
	 */
	@PostMapping("/searchProcess")
	@ResponseBody
	public List<Map<String, Object>> processSearchSelect(@RequestBody Map<String, Object> searchMap) {
		log.info(searchMap.toString());
		List<Map<String, Object>> processList = plService.processInfo(searchMap);
		return processList;
	}
	
	/**
	 * 저장
	 * @param saveDataList
	 * @return int
	 */
	@PostMapping("/processSaveData")
	@ResponseBody
	public int processSaveData(@RequestBody List<Map<String, Object>> saveDataList) {
		int result = plService.saveProcessData(saveDataList);
		log.info("결과값 : " + result);
		return result;
	}
	
	/**
	 * 검색 조건 조회
	 * @param searchMap
	 * @return
	 */
	@PostMapping("/searchLine")
	@ResponseBody
	public List<Map<String, Object>> searchLineSelect(@RequestBody Map<String, Object> searchMap) {
		log.info(searchMap.toString());
		List<Map<String, Object>> lineList = plService.lineInfo(searchMap);
		return lineList;
	}
	
	/**
	 * 저장
	 * @param saveDataList
	 * @return int
	 */
	@PostMapping("/lineSaveData")
	@ResponseBody
	public int saveLineData(@RequestBody List<Map<String, Object>> saveDataList) {
		int result = plService.saveLineData(saveDataList);
		log.info("결과값 : " + result);
		return result;
	}
}
