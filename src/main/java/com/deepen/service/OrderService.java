package com.deepen.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.BuyDTO;
import com.deepen.domain.ClientDTO;
import com.deepen.domain.MaterialDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.mapper.OrdersMapper;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.OrdersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class OrderService {
	
	private final OrdersMapper mapper;
	private final PlansMapper planMapper;
	private final OrdersRepository repository;
	
	/* 주문관리 그리드 정보 조회 */
	public List<OrdersDTO> getOrdersList() {
		return mapper.getOrdersList();
	}
	
	/* 주문관리 그리드 필터링 조회 */
	public List<OrdersDTO> getOrderSerchList(Map<String, String> map) {
		return mapper.getOrderSerchList(map);
	}
	
	/* 주문 상세 - 수주 건 조회 */
	public List<SaleDTO> getDetailSale(String order_id) {
		return mapper.getDetailSale(order_id);
	}

	/* 주문 상세 - 발주 건 조회 */
	public List<BuyDTO> getDetailBuy(String order_id) {
		return mapper.getDetailBuy(order_id);
	}

	/* 주문관리 항목 삭제 */
	/* (외래키 제약조건 CASCADE - 수주/발주 테이블에서도 함께 삭제) */
	public void deleteOrders(List<String> deleteList) {
		repository.deleteAllById(deleteList);
	}
	
	/* 거래처 목록 조회 */
	public List<ClientDTO> getClientSerch(String type) {
		return mapper.getClientSerch(type);
	}
	
	/* 상품 목록 조회 */
	public List<ProductDTO> getPrdctSerch() {
		return mapper.getPrdctSerch();
	}
	
	/* 자재 목록 조회 */
	public List<MaterialDTO> getMtrSerch() {
		return mapper.getMtrSerch();
	}
	
	/* 수주 주문 건 등록 */
	@Transactional
	public void insertSale(Map<String, Object> map) {
		
		// 주문번호 생성
		String order_id = makeOrderID(map);
		
		OrdersDTO order = new OrdersDTO();
		order.setOrder_id(order_id);
		order.setClient_no((Integer)map.get("client_no")); 
		order.setOrder_emp((String)map.get("emp_id"));
		order.setOrder_type("수주");
		
		mapper.insertOrders(order);
		
		List<SaleDTO> createdRows = (List<SaleDTO>) map.get("createdRows");
		
		for(SaleDTO sale : createdRows) {
			sale.setOrder_id(order_id);
			mapper.insertSale(sale);
		}
		
	} // insertSale
	


	/* 발주 주문 건 등록 */
	@Transactional
	public void insertBuy(Map<String, Object> map) {
		// 주문번호 생성
		String order_id = makeOrderID(map);
		
		OrdersDTO order = new OrdersDTO();
		order.setOrder_id(order_id);
		order.setClient_no((Integer)map.get("client_no")); 
		order.setOrder_emp((String)map.get("emp_id"));
		order.setOrder_type("발주");
		
		// 주문 테이블 추가
		mapper.insertOrders(order);
		
		List<BuyDTO> createdRows = (List<BuyDTO>) map.get("createdRows");
		
		for(BuyDTO buy : createdRows) {
			// 발주 테이블 추가
			buy.setOrder_id(order_id);
			mapper.insertBuy(buy);
			
		}
		
	}

	
	/* 주문번호 생성 메서드 */
	public String makeOrderID(Map<String, Object> map) {
		
		String input = (String)map.get("order_date");
		String output = input.substring(2, 4) + input.substring(5, 7) + input.substring(8, 10);
		int client_no = (Integer)map.get("client_no");
		String client = Integer.toString(client_no);
		
		if(client_no / 10 < 1) {
			client = "00" + client_no;
		} else if(client_no / 10 < 10) {
			client = "0" + client_no;
		}
		
		String order_id = "O" + output + "-" + client + "S";
		System.out.println("makeOrderID - order_id = " + order_id);
		
		return order_id;
	}

	public List<Map<String, Object>> getBomList(int product_no) {
		List<Map<String, Object>> bomList = mapper.getgetBomList(product_no);
		log.info("bomList = " + bomList.toString());
		return bomList;
	}

	


	
	
	
	
	

} // PrdctPlanService
