package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.service.WorkInstructionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Log
public class WorkInstructionRestController {
	
	private final WorkInstructionService wiService;

	@GetMapping("/process-info")
	public List<ProcessInfoDTO> getProcessInfo() {
		// selectbox에 넣을 공정 정보
		return wiService.getProcessList();
	}
	
	@GetMapping("/line-info")
	public List<LineInfoDTO> getLineInfo() {
		// selectbox에 넣을 라인 정보
		return wiService.getLineList();
	}
	
	/**
	 * 작업지시 등록 정보 불러오기
	 * @return List<Map<String, Object>>
	 */
	@GetMapping("/reg-work-instruction-info")
	public List<Map<String, Object>> getRegWorkInstructionInfo(){
		List<Map<String, Object>> list = wiService.getRegWorkInstruction();
		return list;
	}
	
	/**
	 * 작업 지시 테이블 insert
	 * @param insertList
	 */
	@PostMapping("/insert-work-instruction")
	public void postMethodName(@RequestBody List<Map<String, Object>> insertList) {
		//log.info(insertList.toString());
		wiService.regWorkInstruction(insertList);
		
	}
	
	/**
	 * 작업 지시 테이블 select
	 * @param
	 */
	@GetMapping("/work-instruction-info")
	public List<Map<String, Object>> getWorkInstruction(){
		
		// 품목 bom에 해당하는 공정 중복값 처리 후 우선순위가 높은 공정 insert
		
		List<Map<String, Object>> list = wiService.getWorkInstruction();
		return list;
	}
}
