package com.deepen.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.InventoryDTO;
import com.deepen.domain.WarehouseDTO;
import com.deepen.mapper.InventoryMapper;
import com.deepen.repository.InventoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class InventoryService {
	
	private final InventoryMapper ivMapper;
	private final InventoryRepository ivRepository;
	
	
	//재고현황 리스트
	public List<InventoryDTO> inventoryStatus(String warehouse_id, String zone, String item_name) {
		return ivMapper.inventoryStatus(warehouse_id, zone, item_name);
	}
 
	
	//창고 조회
	public List<WarehouseDTO> warehouseSelect(){
		return ivMapper.warehouseSelect();
	}
	
	
	//구역 조회(쉼표로 구분된 구역을 List로 변환)
	public List<String> zoneSelect(String warehouse_id){
		String zone = ivMapper.zoneSelect(warehouse_id);
		return Arrays.asList(zone.split("\\s*,\\s*")); //쉼표 앞 뒤의 공백을 무시하고 문자열을 나눈다.
	}
	

	
	
	
	
	
	
	
	
	
	
	
}
