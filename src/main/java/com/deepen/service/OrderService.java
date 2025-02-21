package com.deepen.service;

import java.sql.Date;
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
import com.deepen.entity.Buy;
import com.deepen.entity.Orders;
import com.deepen.entity.Sale;
import com.deepen.mapper.OrdersMapper;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.BuyRepository;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.OrdersRepository;
import com.deepen.repository.SaleRepository;

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
	private final SaleRepository saleRepository;
	private final BuyRepository buyRepository;
	private final CommonDetailRepository cdRepository;
	
	
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
		
		int client_no = (Integer)map.get("client_no");
		String order_type = "수주";
		// 기존 주문번호 존재 확인
		String checkOrderId = mapper.checkIsClient(client_no, order_type);
		// 주문번호 생성
		map.put("type", "S");
		String order_id = makeOrderID(map);
		System.out.println("checkOrderId = " + checkOrderId + " , order_id = " + order_id);
				
		if(checkOrderId == null || checkOrderId.equals("")) {
			OrdersDTO order = new OrdersDTO();
			order.setOrder_id(order_id);
			order.setClient_no(client_no); 
			order.setOrder_emp((String)map.get("emp_id"));
			order.setOrder_type(order_type);
			
			// 주문 테이블 추가
			mapper.insertOrders(order);
			
		} else if(checkOrderId.equals(order_id)) {
			mapper.updateOrder(order_id);
		}
		
		List<SaleDTO> createdRows = (List<SaleDTO>) map.get("createdRows");
		
		for(SaleDTO sale : createdRows) {
			sale.setOrder_id(order_id);
			mapper.insertSale(sale);
		}
		
	} // insertSale
	


	/* 발주 주문 건 등록 */
	@Transactional
	public void insertBuy(Map<String, Object> map) {
		
		int client_no = (Integer)map.get("client_no");
		String order_type = "발주";
		// 기존 주문번호 존재 확인
		String checkOrderId = mapper.checkIsClient(client_no, order_type);
		// 주문번호 생성
		map.put("type", "B");
		String order_id = makeOrderID(map);
		System.out.println("checkOrderId = " + checkOrderId + " , order_id = " + order_id);
				
		if(checkOrderId == null || checkOrderId.equals("")) {
			OrdersDTO order = new OrdersDTO();
			order.setOrder_id(order_id);
			order.setClient_no(client_no); 
			order.setOrder_emp((String)map.get("emp_id"));
			order.setOrder_type(order_type);
			
			// 주문 테이블 추가
			mapper.insertOrders(order);
			
		} else if(checkOrderId.equals(order_id)) {
			mapper.updateOrder(order_id);
			
		}
		
		List<BuyDTO> createdRows = (List<BuyDTO>) map.get("createdRows");
		
		for(BuyDTO buy : createdRows) {
			// 발주 테이블 추가
			buy.setOrder_id(order_id);
			mapper.insertBuy(buy);
			log.info("buy = " + buy.toString());
			// 입고 대기 추가
			Map<String, Object> inbound = new HashMap<>();
			inbound.put("in_qty", buy.getBuy_vol());
			inbound.put("buy_no", buy.getBuy_no());
			inbound.put("item_no", buy.getMtr_no());
			inbound.put("warehouse_id", "미정");
			
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
		
		String order_id = "O" + output + "-" + client + map.get("type");
		System.out.println("makeOrderID - order_id = " + order_id);
		
		return order_id;
	}
	
	// 상품번호별 모든 bom 조회
	public List<Map<String, Object>> getBomList(int product_no) {
		List<Map<String, Object>> bomList = mapper.getgetBomList(product_no);
		log.info("bomList = " + bomList.toString());
		return bomList;
	}
	
	// 동일일자 기등록된 거래처인지 확인 
	public String checkIsClient(int client_no, String order_type) {
		return mapper.checkIsClient(client_no, order_type);
	}

	// 수주 정보 수정
	public void updateSale(List<SaleDTO> updatedRows) {
		for(SaleDTO sale : updatedRows) {
			Sale saleEtt = Sale.setSaleEntity(sale);
			saleEtt.setSale_unit(cdRepository.findCommonDetailCodeByName(sale.getUnit_name())); 
			saleRepository.save(saleEtt);
			mapper.updateOrder(sale.getOrder_id());
		}
	}

	// 발주 정보 수정
	public void updateBuy(List<BuyDTO> updatedRows) {
		for(BuyDTO buy : updatedRows) {
			Buy buyEtt = Buy.setBuyEntity(buy);
			buyEtt.setBuy_unit(cdRepository.findCommonDetailCodeByName(buy.getUnit_name())); 
			buyRepository.save(buyEtt);
			mapper.updateOrder(buy.getOrder_id());
		}
	}

	public int getProcessTime(int product_no, int sale_vol) {
		int time_sum = 0;
		
		List<Map<String, Object>> bomList = planMapper.getUseBoMList(product_no);
		
		for(Map<String, Object> bom : bomList) {
			int sum = planMapper.sumProcessTime((String) bom.get("PROCESS_NAME"));
			if(bom.containsKey("PROCESS_COUNT")) {
				sum *= Integer.parseInt(bom.get("PROCESS_COUNT").toString());
			} 
			time_sum += sum;
		}
		
		return time_sum * sale_vol;
	}

	
	


	
	
	
	
	

} // PrdctPlanService