package com.deepen.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.OrdersDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.PlansRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class PlanService {
	
	private final PlansMapper mapper;
	private final PlansRepository repository;
	
	public List<PlansDTO> getPlanList() {
		return mapper.getPlanList();
	}
	
	public List<OrdersDTO> getPlanSerchList(Map<String, String> map) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Transactional
	public List<SaleDTO> getRegPlanList() {
		List<SaleDTO> saleList = mapper.getRegPlanList();
		int time_sum = 0;
		
		for(SaleDTO sale : saleList) {
			List<Map<String, Object>> bomList = mapper.getUseBoMList(sale.getProduct_no());
			System.out.println("bomList = " + bomList);
			time_sum = 0;
			
			for(Map<String, Object> map : bomList) {
				int sum = mapper.sumProcessTime((String) map.get("PROCESS_NAME"));
				time_sum += sum;
			}
			
			sale.setTime_sum(time_sum * sale.getSale_vol());
		}
		
		return saleList;
	} // getRegPlanList
	 
	@Transactional
	public boolean checkMtr(int product_no, int sale_vol) {
		// 최종 반환할 값(재고 있음/없음)
		boolean isMtr = true;
		
		// 현재 재고 
		List<Map<String, Object>> inventory = mapper.getInventorty();
		System.out.println("inventory = " + inventory);
		
		// 재고에서 사용될 예정인 생산계획에 등록된 수주 건의 bom 목록
		List<Map<String, Object>> planBomList = mapper.getPlanBomList();
		System.out.println("planBomList = " + planBomList);
		
		//재고 검사할 상품의 bom 목록
		List<Map<String, Object>> bomList = mapper.getUseBoMList(product_no);
		System.out.println("bomList = " + bomList);
		
		// 재고 정보를 맵으로 변환 (mtr_no 기준)
		Map<Integer, Integer> inventoryMap = new HashMap<>();
		
		for (Map<String, Object> item : inventory) {  // <== `Integer`가 아니라 `Object`로 변경
		    int mtrNo = ((Number) item.get("ITEM_NO")).intValue(); // Number로 변환 후 intValue()
		    int qty = ((Number) item.get("INVENTORY_QTY")).intValue(); // Number로 변환 후 intValue()

		    inventoryMap.put(mtrNo, qty);
		}
		
		// planBomList의 사용량만큼 재고 차감
		for (Map<String, Object> planBom : planBomList) {
			int mtrNo = planBom.get("MTR_NO") != null ? Integer.parseInt((String) planBom.get("MTR_NO")) : 0;
			int bomQty = planBom.get("TOTAL_QUANTITY") != null ? ((Number) planBom.get("TOTAL_QUANTITY")).intValue()
						   : Integer.parseInt((String) planBom.get("BOM_QUANTITY"));
		    if (inventoryMap.containsKey(mtrNo)) {
		        inventoryMap.put(mtrNo, inventoryMap.get(mtrNo) - bomQty);
		    }
		}
		
		// bomList의 BOM_QUANTITY만큼 재고 차감
		for (Map<String, Object> bom : bomList) {
			int mtrNo = bom.get("MTR_NO") != null ? Integer.parseInt((String) bom.get("MTR_NO"))  : 0;
			int bomQty = bom.get("TOTAL_QUANTITY") != null ? ((Number) bom.get("TOTAL_QUANTITY")).intValue()
						   : Integer.parseInt((String) bom.get("BOM_QUANTITY"));
		    if (inventoryMap.containsKey(mtrNo)) {
		        inventoryMap.put(mtrNo, inventoryMap.get(mtrNo) - bomQty);
		    }
		}
		
		// 모든 bomList의 mtr_no가 inventory에 존재하며, 수량이 1 이상인지 확인
		for (Map<String, Object> bom : bomList) {
			int mtrNo = bom.get("MTR_NO") != null ? Integer.parseInt((String) bom.get("MTR_NO"))  : 0;

		    if (!inventoryMap.containsKey(mtrNo) || inventoryMap.get(mtrNo) < 1) {
		        isMtr = false; // 자재 없음 또는 부족
		        break;
		    }
		}
		
		System.out.println("isMtr = " + isMtr);
		return isMtr;
		
	} // checkMtr 
	
	
	
	
	
	
	
	

} // PrdctPlanService
