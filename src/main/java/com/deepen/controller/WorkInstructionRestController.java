package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.service.WorkInstructionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;




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
	 * @param planIdList
	 */
	@PostMapping("/insert-work-instruction")
	public void insertWorkInstruction(@RequestBody List<Map<String, Object>> planIdList) {
		wiService.regWorkInstruction(planIdList);
	}
	
	/**
	 * 작업 지시 테이블 검색 조회
	 * @param
	 */
	@GetMapping("/work-instruction-info")
	public List<Map<String, Object>> getWorkInstruction(
			@RequestParam(value = "planNo", required = false) String planNo,
			@RequestParam(value = "startDate", required = false) String startDate,
			@RequestParam(value = "endDate", required = false) String endDate,
			@RequestParam(value = "processNo", required = false) String processNo,
			@RequestParam(value = "lineNo", required = false) String lineNo){
		
		Map<String, Object> params =  new HashMap<>();
		params.put("planNo", planNo);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("processNo", processNo);
		params.put("lineNo", lineNo);
		
		log.info("필터 검색 조회 : "+params.toString());
		
		List<Map<String, Object>> list = wiService.getWorkInstruction(params);
		return list;
	}
	
	/**
	 * 클릭한 로우의 품목을 만드는데 필요한 자재 정보 조회
	 */
	@GetMapping("/material-info-by-row-selection")
	public List<Map<String, Object>> getMaterialsByRowSelection(@RequestParam("productNo") String productNo,
																@RequestParam("vol") String vol){
		
		List<Map<String, Object>> materialsList  = wiService.getMaterialsByProductNo(productNo,vol);
		return materialsList;
	}
	
	@PostMapping("/insert-material-warehouse")
	public void insertMaterialInWarehouse(@RequestBody List<Map<String, Object>> insertMaterialData) {
		wiService.insertMaterialInWareHouse(insertMaterialData);
	}
	
	@PostMapping("/start-work-instruction")
	public void startWorkInstruction(@RequestBody List<Map<String, Object>> updateDataList,
									HttpServletRequest request) {
		
		HttpSession session = request.getSession();
		Map<String, Object> empInfo = (Map<String, Object>)session.getAttribute("sEmp");
		String sessionEmpId = (String) empInfo.get("EMP_ID");
		
		// 작업 시작 버튼 동작
		wiService.startWorkInstruction(updateDataList,sessionEmpId);
	}
	
	@PostMapping("/count-outbound-items-by-wiNo")
	public int getCountOutboundItemsByWiNo(@RequestBody List<Map<String, Object>> checkedWiGrid) {
		
		// 출고 대기 항목 갯수 확인 후 작업 시작 버튼 제어
		int itemsNumber = wiService.getCountOutboundItemsByWiNo(checkedWiGrid);
		log.info("출고 대기 항목 갯수 : "+itemsNumber);
		
		return itemsNumber;
	}
	
	
	
	
	@PostMapping("/complete-process")
	public void processComplete(@RequestBody List<Map<String, Object>> updateDataList,
								HttpServletRequest request) {
		
		HttpSession session = request.getSession();
		Map<String, Object> empInfo = (Map<String, Object>)session.getAttribute("sEmp");
		String sessionEmpId = (String) empInfo.get("EMP_ID");
		
		wiService.completeProcess(updateDataList,sessionEmpId);
		
	}
	
	@PostMapping("/check-defect")
	public void checkDefect(@RequestBody List<Map<String, Object>> updateDataList,
							HttpServletRequest request) {
		
		HttpSession session = request.getSession();
		Map<String, Object> empInfo = (Map<String, Object>)session.getAttribute("sEmp");
		String sessionEmpId = (String) empInfo.get("EMP_ID");
		
		wiService.checkDefect(updateDataList,sessionEmpId);
		
	}

	
	@PostMapping("/end-work-instruction")
	public void endWorkInstruction(@RequestBody List<Map<String, Object>> updateDataList,
								HttpServletRequest request) {
		
		wiService.endWorkInstruction(updateDataList);
		
	}
}
