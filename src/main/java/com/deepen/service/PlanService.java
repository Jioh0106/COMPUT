package com.deepen.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.OrdersDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;
import com.deepen.entity.Plans;
import com.deepen.mapper.PlansMapper;
import com.deepen.repository.PlansRepository;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Log
@Service
public class PlanService {
	
	private final PlansMapper mapper;
	private final PlansRepository repository;
	private final HttpSession session;
	
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
		
		// 재고에서 사용될 예정인 생산계획에 등록된 수주 건의 bom 목록
		List<Map<String, Object>> planBomList = mapper.getPlanBomList();
		
		//재고 검사할 상품의 bom 목록
		List<Map<String, Object>> bomList = mapper.getUseBoMList(product_no);
		
		// 재고 정보를 맵으로 변환 (mtr_no 기준)
		Map<Integer, Integer> inventoryMap = new HashMap<>();
		for (Map<String, Object> item : inventory) { 
		    int mtrNo = ((Number) item.get("ITEM_NO")).intValue(); 
		    int qty = ((Number) item.get("INVENTORY_QTY")).intValue();
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
		
		// 모든 bomList의 mtr_no가 inventory 에 존재하며, 수량이 1 이상인지 확인
		for (Map<String, Object> bom : bomList) {
			int mtrNo = bom.get("MTR_NO") != null ? Integer.parseInt((String) bom.get("MTR_NO"))  : 0;
			
			// 원자재 소요량 bom 만 거르기
			if(inventoryMap.get(mtrNo) != null && mtrNo !=0) {
				if (!inventoryMap.containsKey(mtrNo) || inventoryMap.get(mtrNo) < 1) {
					isMtr = false; // 자재 없음 또는 부족
					break;
				}
			}
		}
		return isMtr;
	} // checkMtr 
		

	public void regPlans(List<Map<String, Object>> regList) {
		Map<String, Object> emp = (Map<String, Object>) session.getAttribute("sEmp");
		String emp_id = (String) emp.get("EMP_ID");
		
		for(Map<String, Object> reg : regList) {
			Plans plan = new Plans();
			String plan_id = makePlanID(reg);
			String startDateStr = (String) reg.get("plan_start_date");
			String endDateStr = (String) reg.get("plan_end_date");
			LocalDate localDateS = LocalDate.parse(startDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
			LocalDate localDateE = LocalDate.parse(endDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
			
			plan.setPlan_id(plan_id);
			plan.setOrder_id((String) reg.get("order_id"));
			plan.setSale_no((Integer) reg.get("sale_no"));
			plan.setEmp_id(emp_id);
			plan.setPlan_status("PRGR001");
			plan.setPlan_priority((String) reg.get("plan_priority"));
			plan.setPlan_start_date(localDateS);
			plan.setPlan_end_date(localDateE);
			plan.setPlan_date(new Timestamp(System.currentTimeMillis()));
			log.info(plan.toString());
			
			repository.save(plan);
		}
		
		
	} // savePlans
	
	
	/* 생산계획번호 생성 메서드 */
	public String makePlanID(Map<String, Object> map) {
		
		String order_id = (String) map.get("order_id");
		int product_no = (Integer)map.get("product_no");
		
	    String fetchedPlanId = mapper.getPlanOrderId(order_id);
	    String rastPlanId = "00"; // 기본값 설정

	    if (fetchedPlanId != null) {
	        String[] parts = fetchedPlanId.split("-");
	        
	        if (parts.length > 3) {
	            rastPlanId = parts[3];
	        }
	    }

	    int rast_no = Integer.parseInt(rastPlanId) + 1;
	    String rast = String.format("%02d", rast_no); 

		String plan_id = order_id + "-" + product_no + "-" + rast;
		return plan_id;
	}

	public void deletePlans(List<String> deleteList) {
		repository.deleteAllById(deleteList);
	}

	public void updatePlans(List<Plans> updatedRows) {
		for(Plans row : updatedRows) {
			row.setPlan_update(new Timestamp(System.currentTimeMillis()));
			repository.save(row);
		}
	}
	
	
	
	

} // PrdctPlanService
