package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.ClientDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.mapper.OrdersMapper;
import com.deepen.repository.OrdersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class OrderService {
	
	private final OrdersMapper mapper;
	private final OrdersRepository repository;
	
	/** 주문관리 그리드 정보 조회 **/
	public List<OrdersDTO> getOrdersList() {
		return mapper.getOrdersList();
	}

	/** 주문관리 항목 삭제 **/
	/** (외래키 제약조건 CASCADE - 수주/발주 테이블에서도 함께 삭제) **/
	public void deleteOrders(List<String> deleteList) {
		repository.deleteAllById(deleteList);
	}
	
	/** 거래처 목록 조회 **/
	public List<ClientDTO> getClientSerch(String type) {
		return mapper.getClientSerch(type);
	}
	
	/** 상품 목록 조회 **/
	public List<ProductDTO> getPrdctSerch() {
		return mapper.getPrdctSerch();
	}
	
	/* 수주 주문 건 등록 */
	@Transactional
	public void insertSale(Map<String, Object> map) {
		String input = (String)map.get("order_date");
		String output = input.substring(2, 4) + input.substring(5, 7) + input.substring(8, 10);
		int client_no = (Integer)map.get("client_no");
		String client = Integer.toString(client_no);
		if(client_no / 10 < 1) {
			client = "00" + client_no;
		} else if(client_no / 10 < 10) {
			client = "0" + client_no;
		}
		
		
		String Order_id = "O" + output + "-" + client + "S";
		
		OrdersDTO order = new OrdersDTO();
		order.setOrder_id(Order_id);
		order.setClient_no(client_no); 
		order.setOrder_emp((String)map.get("emp_id"));
		order.setOrder_type("수주");
		
		mapper.insertOrders(order);
		
		List<SaleDTO> createdRows = (List<SaleDTO>) map.get("createdRows");
		
		for(SaleDTO sale : createdRows) {
			sale.setOrder_id(Order_id);
			mapper.insertSale(sale);
		}
		
		
		
	}
	
	/* 주문 상세 - 수주 건 조회 */
	public List<Map<String, Object>> getDetailSale(String order_id) {
		return mapper.getDetailSale(order_id);
	}

	/* 주문 상세 - 발주 건 조회 */
	public List<Map<String, Object>> getDetailBuy(String order_id) {
		return mapper.getDetailBuy(order_id);
	}

	
	
	
	
	
	
	

} // PrdctPlanService
