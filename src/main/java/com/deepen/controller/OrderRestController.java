package com.deepen.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.ClientDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/order")
@Log
public class OrderRestController {
	
	/** 주문관리 서비스 */
	private final OrderService service;
	
	/** 주문관리 목록 조회 **/
	@GetMapping("/list")
	public ResponseEntity<List<OrdersDTO>> getOrdersList(@RequestParam("reg_date") String reg_date, 
													@AuthenticationPrincipal User user) {
		
		String emp_id = user.getUsername();
		
		Map<String, String> map = new HashMap<>();
		map.put("emp_id", emp_id);
		map.put("reg_date", reg_date);
		
		List<OrdersDTO> list = service.getOrdersList();
		
		return ResponseEntity.ok(list);
        
	}
	
	/** 주문 상세 - 수주 목록 조회 **/
	@GetMapping("/detail/sale")
	public ResponseEntity<List<Map<String, Object>>>  getDetailSale(@RequestParam("order_id") String order_id) {
		
		log.info("order_id = " + order_id);
		List<Map<String, Object>> list = service.getDetailSale(order_id);
		
		return ResponseEntity.ok(list);
		
	}
	
	/** 주문 상세 - 발주 목록 조회 **/
	@GetMapping("/detail/buy")
	public ResponseEntity<List<Map<String, Object>>> getDetailBuy(@RequestParam("order_id") String order_id) {
		
		log.info("order_id = " + order_id);
		List<Map<String, Object>> list = service.getDetailBuy(order_id);
		
		return ResponseEntity.ok(list);
		
	}
	
	/** 주문관리 그리드 정보 삭제 **/
	@PostMapping("/delete")
	public ResponseEntity<String> deleteOrder(@RequestBody List<String> deleteList) {
		
		log.info("deleteList - " + deleteList.toString());
		
		try {
			service.deleteOrders(deleteList);
			return ResponseEntity.ok("삭제가 완료되었습니다.");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
		}
	}
	
	
	/** 거래처 검색 정보 가져오기 **/
	@GetMapping("/serch/client")
	public ResponseEntity<List<ClientDTO>> getClientSerch(@RequestParam("type") String type)  {
		
		List<ClientDTO> list = service.getClientSerch(type);
		
		if (list == null || list.isEmpty()) {
	        log.info("No results found for type: " + type);
	        return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
	    }
		log.info("getClientSerch : " + list.toString());
		return ResponseEntity.ok(list);
		
	} // getAbsenceRequest
	
	/** 상품 검색 정보 가져오기 **/
	@GetMapping("/serch/prdct")
	public ResponseEntity<List<ProductDTO>> getProductSerch()  {
		
		List<ProductDTO> list = service.getPrdctSerch();
		
		if (list == null || list.isEmpty()) {
			return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
		}
		log.info("getClientSerch : " + list.toString());
		return ResponseEntity.ok(list);
		
	} // getAbsenceRequest
	
	/** 수주 등록 **/
	@PostMapping("/save/sale")
    public ResponseEntity<List<OrdersDTO>> saveSale(@RequestBody Map<String, Object> param,
    												@AuthenticationPrincipal User user) {
		List<?> rows = (List<?>) param.get("createdRows");
		List<SaleDTO> createdRows = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
	    for (Object obj : rows) {
	        // 각 obj는 LinkedHashMap이므로, mapper.convertValue를 사용하여 SaleDTO로 변환
	        SaleDTO sale = mapper.convertValue(obj, SaleDTO.class);
	        createdRows.add(sale);
	    }
		int client_no = Integer.parseInt((String) param.get("client_no"));
		String order_date =(String) param.get("order_date");
		String emp_id = user.getUsername();
		
		log.info("createdRows : " + createdRows.toString());
		log.info("client_no : " + param.get("client_no"));
		log.info("order_date : " + param.get("order_date"));
		log.info("emp_id : " + param.get("emp_id"));
		
		Map<String, Object> map = new HashMap<>();
		map.put("createdRows", createdRows);
		map.put("client_no", client_no);
		map.put("order_date", order_date);
		map.put("emp_id", emp_id);
		
		// 추가 항목 저장 처리
		if (createdRows != null && !createdRows.isEmpty()) {
			service.insertSale(map);
		}
        
        // 최신 데이터 반환
		List<OrdersDTO> Orderlist = service.getOrdersList();
        return ResponseEntity.ok(Orderlist);
    }
	 
	
	
} // PlanRestController