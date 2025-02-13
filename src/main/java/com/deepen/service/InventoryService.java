package com.deepen.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.InventoryDTO;
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
	public List<InventoryDTO> inventoryStatus() {
		return ivMapper.inventoryStatus();
	}
	
	//재고현황 업데이트
//	 public void updateInventory(Integer inventory_no, Integer inventory_count, String mod_user) {
//        LocalDateTime now = LocalDateTime.now(); 
//        ivRepository.updateInventory(inventory_no, inventory_count, mod_user, now);
//    } 
	
	
	
}
