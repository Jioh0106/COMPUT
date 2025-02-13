package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.InvHistoryDTO;
import com.deepen.domain.InventoryDTO;
import com.deepen.service.InvHistoryService;
import com.deepen.service.InventoryService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inventory")
@Log
public class InventoryRestController {
	
	private final InventoryService ivService;
	private final InvHistoryService invhService;
	
	
	
	//재고현황 조회
	@GetMapping("/list")
	public List<InventoryDTO> inventoryStatus(){
		return ivService.inventoryStatus();
	}
	
	//재고현황 업데이트
//	@PostMapping("/update")
//	public void updateInventory(@RequestBody List<InventoryDTO> modifiedRows, HttpSession session) {
//	 
//		Map<String, Object> emp = (Map<String, Object>) session.getAttribute("sEmp");
//		String emp_id = (String)emp.get("EMP_ID");
//		
//		
//	    log.info("@@로그인한 사번:"+ emp_id);
//	    System.out.println("수정한 행"+modifiedRows.toString());
//	    for (InventoryDTO row : modifiedRows) {
//	        Integer inventory_no = ((InventoryDTO) row).getInventory_no();
//	        Integer inventory_count = row.getInventory_count();
//	        row.setMod_user(emp_id);
//	        String mod_user = row.getMod_user();
//	        
//	        if (inventory_no != null && inventory_count != null && mod_user !=null) {
//	            ivService.updateInventory(inventory_no, inventory_count, emp_id);
//	            log.info(" 업데이트 완료: 재고번호({}), 실재고량({})"+ inventory_no + " " +inventory_count);
//	        } else {
//	            log.info(" 유효하지 않은 데이터: "+ row);
//	        }
//	    }
//	}
//	
	
	//---------------------------------실재고변경 이력 모달창 시작
	
	//변경이력 테이블 저장 , 재고현황 테이블 업데이트
	@PostMapping("/history/save")
	public ResponseEntity<String> saveInventoryHistory(@RequestBody List<InvHistoryDTO> historyDtoList){
		invhService.saveInventoryHistory(historyDtoList);
		return ResponseEntity.ok("변경이력 저장 및 재고 업데이트 완료");
	}
	
	//특정 재고번호 변경이력 조회
	@GetMapping("/history/{inventory_no}")
	public List<Map<String, Object>> historyList(@PathVariable("inventory_no") Integer inventory_no){
		return invhService.historyList(inventory_no);
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
