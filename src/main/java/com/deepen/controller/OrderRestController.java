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

import com.deepen.domain.BuyDTO;
import com.deepen.domain.ClientDTO;
import com.deepen.domain.MaterialDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/order")
@Log
public class OrderRestController {
	
	/* 주문관리 서비스 */
	private final OrderService service;
	
	/* 주문관리 목록 조회 */
	@GetMapping("/list")
	public ResponseEntity<List<OrdersDTO>> getOrdersList(HttpSession session) {
		session.getAttribute("sEmp");
		
		List<OrdersDTO> list = service.getOrdersList();
		
		return ResponseEntity.ok(list);
        
	} // getOrdersList
	
	
	/* 주문관리 목록 필터링 조회 */
	@GetMapping("/list/serch")
	public ResponseEntity<List<OrdersDTO>> getOrderSerchList(@RequestParam("reg_date") String reg_date,
														     @RequestParam("search_word") String search_word,
														     @RequestParam("check_value") String check_value) {
		
		if(check_value.equals("") || check_value == null) {
			check_value = "";
		}
		
		Map<String, String> map = new HashMap<>();
		map.put("reg_date", reg_date);
		map.put("search_word", search_word);
		map.put("check_value", check_value);
		
		List<OrdersDTO> list = service.getOrderSerchList(map);
		log.info("getOrderSerchList = " +  list.toString());
		
		return ResponseEntity.ok(list);
        
	} // getOrdersList
	
	
	/* 주문 상세 - 수주 목록 조회 */
	@GetMapping("/detail/sale")
	public ResponseEntity<List<SaleDTO>>  getDetailSale(@RequestParam("order_id") String order_id) {
		
		log.info("order_id = " + order_id);
		List<SaleDTO> list = service.getDetailSale(order_id);
		
		return ResponseEntity.ok(list);
		
	} // getDetailSale
	
	/* 주문 상세 - 발주 목록 조회 */
	@GetMapping("/detail/buy")
	public ResponseEntity<List<BuyDTO>> getDetailBuy(@RequestParam("order_id") String order_id) {
		
		log.info("order_id = " + order_id);
		List<BuyDTO> list = service.getDetailBuy(order_id);
		
		return ResponseEntity.ok(list);
		
	} // getDetailBuy
	
	/* 주문관리 그리드 정보 삭제 */
	@PostMapping("/delete")
	public ResponseEntity<String> deleteOrder(@RequestBody List<String> deleteList) {
		
		log.info("deleteList - " + deleteList.toString());
		
		try {
			service.deleteOrders(deleteList);
			return ResponseEntity.ok("삭제가 완료되었습니다.");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
		}
	} // deleteOrder
	
	
	/* 거래처 검색 정보 가져오기 */
	@GetMapping("/serch/client")
	public ResponseEntity<List<ClientDTO>> getClientSerch(@RequestParam("type") String type)  {
		
		List<ClientDTO> list = service.getClientSerch(type);
		
		if (list == null || list.isEmpty()) {
	        log.info("No results found for type: " + type);
	        return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
	    }
		log.info("getClientSerch : " + list.toString());
		return ResponseEntity.ok(list);
		
	} // getClientSerch
	
	/* 상품 검색 정보 가져오기 */
	@GetMapping("/serch/prdct")
	public ResponseEntity<List<ProductDTO>> getProductSerch()  {
		
		List<ProductDTO> list = service.getPrdctSerch();
		
		if (list == null || list.isEmpty()) {
			return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
		}
		log.info("getProductSerch : " + list.toString());
		return ResponseEntity.ok(list);
		
	} // getProductSerch
	
	/* 자재 검색 정보 가져오기 */
	@GetMapping("/serch/mtr")
	public ResponseEntity<List<MaterialDTO>> getMtrSerch()  {
		
		List<MaterialDTO> list = service.getMtrSerch();
		
		if (list == null || list.isEmpty()) {
			return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
		}
		log.info("getMtrSerch : " + list.toString());
		return ResponseEntity.ok(list);
		
	} // getMtrSerch
	
	/* 수주 등록 */
	@PostMapping("/save/sale")
    public ResponseEntity<List<OrdersDTO>> saveSale(@RequestBody Map<String, Object> param, @AuthenticationPrincipal User user) {

		List<?> rows = (List<?>) param.get("createdRows");
		List<SaleDTO> createdRows = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
	    for (Object obj : rows) {
	        SaleDTO sale = mapper.convertValue(obj, SaleDTO.class);
	        createdRows.add(sale);
	    }
		int client_no = Integer.parseInt((String) param.get("client_no"));
		String order_date =(String) param.get("order_date");
		String emp_id = user.getUsername();
		
		log.info("createdRows : " + createdRows.toString());
		log.info("client_no : " + param.get("client_no"));
		log.info("order_date : " + param.get("order_date"));
		
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
        
    } // saveSale
	 
	/* 발주 등록 */
	@PostMapping("/save/buy")
    public ResponseEntity<List<OrdersDTO>> saveBuy(@RequestBody Map<String, Object> param, @AuthenticationPrincipal User user) {
    												
		List<?> rows = (List<?>) param.get("createdRows");
		List<BuyDTO> createdRows = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
	    for (Object obj : rows) {
	    	BuyDTO buy = mapper.convertValue(obj, BuyDTO.class);
	        createdRows.add(buy);
	    }
		int client_no = Integer.parseInt((String) param.get("client_no"));
		String order_date =(String) param.get("order_date");
		String emp_id = user.getUsername();
		
		log.info("createdRows : " + createdRows.toString());
		log.info("client_no : " + param.get("client_no"));
		log.info("order_date : " + param.get("order_date"));
		
		Map<String, Object> map = new HashMap<>();
		map.put("createdRows", createdRows);
		map.put("client_no", client_no);
		map.put("order_date", order_date);
		map.put("emp_id", emp_id);
		
		// 추가 항목 저장 처리
		if (createdRows != null && !createdRows.isEmpty()) {
			service.insertBuy(map);
		}
		
        // 최신 데이터 반환
		List<OrdersDTO> Orderlist = service.getOrdersList();
        return ResponseEntity.ok(Orderlist);
		
	} // saveBuy
	
} // PlanRestController