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
import com.deepen.domain.WarehouseDTO;
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
	public List<InventoryDTO> inventoryStatus(@RequestParam(value = "warehouse_id", required = false) 
											  String warehouse_id,
											  @RequestParam(value = "zone", required = false) 
											  String zone,
											  @RequestParam(value = "item_name", required = false) 
											  String item_name) {
		
		return ivService.inventoryStatus(warehouse_id, zone, item_name);
	}
	
	
	
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
	
	//변경이력 삭제
	@PostMapping("/history/delete")
	public ResponseEntity<?> deleteHistory(@RequestBody Map<String, Object> request){
		List<Integer> historyNoList = (List<Integer>)request.get("historyNoList");
		Integer inventoryNo = (Integer)request.get("inventoryNo");
		
		invhService.deleteAndUpdateInv(historyNoList, inventoryNo);
		
		return ResponseEntity.ok("삭제 완료 및 재고 현황 업데이트 완료");
		
	}
	
	//---------------------------------------------------
	
	//창고 조회
	@GetMapping
	public ResponseEntity<List<WarehouseDTO>> warehousSelect(){
		return ResponseEntity.ok(ivService.warehouseSelect());
	}
	
	//구역 조회
	@GetMapping("/{warehouse_id}/zone")
	public ResponseEntity<List<String>> zoneSelect(@PathVariable("warehouse_id")String warehouse_id){
		return ResponseEntity.ok(ivService.zoneSelect(warehouse_id));
	}
	
	
	
	
	
	
	
	
	
	
	
}
