package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.OrdersDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.service.PlanService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/plan")
@Log
public class PlanRestController {
	
	/* 생산계획 서비스 */
	private final PlanService service;
	
	/* 생산계획 목록 조회 */
	@GetMapping("/list")
	public ResponseEntity<List<PlansDTO>> getPlanList(HttpSession session) {
		session.getAttribute("sEmp");
		
		List<PlansDTO> list = service.getPlanList();
		
		return ResponseEntity.ok(list);
        
	} // getPlanList
	
	/* 생산계획 목록 필터링 조회 */
	@GetMapping("/list/serch")
	public ResponseEntity<List<OrdersDTO>> getPlanSerchList(@RequestParam("reg_date") String reg_date,
														     @RequestParam("search_word") String search_word,
														     @RequestParam("check_value") String check_value) {
		
		if(check_value.equals("") || check_value == null) {
			check_value = "";
		}
		
		Map<String, String> map = new HashMap<>();
		map.put("reg_date", reg_date);
		map.put("search_word", search_word);
		map.put("check_value", check_value);
		
		List<OrdersDTO> list = service.getPlanSerchList(map);
		log.info("getOrderSerchList = " +  list.toString());
		
		return ResponseEntity.ok(list);
        
	} // getPlanSerchList
	
	
	/* 생산계획 등록 가능 목록 조회 */
	@GetMapping("/reg/list")
	public ResponseEntity<List<SaleDTO>> getRegPlanList() {
		
		List<SaleDTO> list = service.getRegPlanList();
		
		return ResponseEntity.ok(list);
        
	} // getRegPlanList
	
	/* 생산계획 그리드 정보 저장 */
	@GetMapping("/check/mtr")
	public boolean checkMtr(@RequestParam("product_no") int product_no, 
							@RequestParam("sale_vol") int sale_vol) {
		System.out.println("product_no = " + product_no);
		System.out.println("sale_vol = " + sale_vol);
		boolean isCheckMtr = service.checkMtr(product_no, sale_vol);
		
		return isCheckMtr;
        
	} // checkMtr
	
	
	/* 생산계획 등록 */
	@PostMapping("/save")
	public ResponseEntity<String> savePlans(@RequestBody List<Map<String, Object>> selectedRows) {
		System.out.println("selectedRows = " + selectedRows);
		
		try {
			service.savePlans(selectedRows);
			return ResponseEntity.ok("생산계획 등록이 완료되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("생산계획 등록 중 오류 발생");
		}
	}
	
	
	
	/* 생산계획 그리드 정보 삭제 */
	
	
	
} // PlanRestController