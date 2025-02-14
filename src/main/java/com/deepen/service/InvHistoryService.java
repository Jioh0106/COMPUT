package com.deepen.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.InvHistoryDTO;
import com.deepen.entity.InvHistory;
import com.deepen.entity.Inventory;
import com.deepen.mapper.InventoryHistoryMapper;
import com.deepen.repository.InvHistoryRepository;
import com.deepen.repository.InventoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class InvHistoryService {
	
	private final InventoryHistoryMapper invhMapper;
	private final InventoryRepository ivReposiotry;
	private final InvHistoryRepository invhRepository;
	
	
	//변경사유 공통코드
	public List<Map<String, Object>> reasonChangeList(){
		return invhMapper.reasonChangeList();
	}
	
	//변경이력 테이블 insert, 재고현황 테이블 update
	public void saveInventoryHistory(List<InvHistoryDTO> invhDtoList) {
		for(InvHistoryDTO dto : invhDtoList) {
			InvHistory invHistory = new InvHistory();
			invHistory.setInventory_no(dto.getInventory_no()); //재고번호 FK
			invHistory.setPrev_count(dto.getPrev_count());
			invHistory.setNew_count(dto.getNew_count());
			invHistory.setMod_user(dto.getMod_user());
			invHistory.setChange_reason(dto.getChange_reason());
			invHistory.setReason_detail(dto.getReason_detail());
			invHistory.setMod_date(LocalDateTime.now());
			invHistory.setDiff_count(dto.getDiff_count()); 
			
			invhRepository.save(invHistory);//변경이력테이블에 저장
			
			log.info("재고번호 :"+ dto.getInventory_no());
			Optional<Inventory> optInventory = ivReposiotry.findById(dto.getInventory_no());
			Inventory inventory = optInventory.get();
			inventory.setInventory_qty(invHistory.getNew_count()); //재고량
			inventory.setInventory_count(invHistory.getNew_count()); //실재고량
			inventory.setInventory_change_date(invHistory.getMod_date()); //재고량변경일
			
			ivReposiotry.save(inventory);
			
		}
	}
	
	
	//특정 재고번호 변경이력 조회
	public List<Map<String, Object>> historyList(Integer inventory_no){
		log.info("클릭한 재고번호 :" + inventory_no);
		return invhMapper.historyList(inventory_no);
	}
	
	
	//변경이력 삭제 후 재고현황 테이블 업데이트 처리
	public void deleteAndUpdateInv(List<Integer> historyNoList, Integer inventoryNo) {
		if(historyNoList == null || historyNoList.isEmpty()) {
			throw new IllegalArgumentException("삭제할 변경이력이 없습니다.");
		}
		
		//삭제처리
		invhMapper.deleteHistory(historyNoList);
		log.info("삭제된 히스토리번호 : "+ historyNoList);
		//업데이트처리
		invhMapper.updateInv(inventoryNo);
		log.info("업데이트된 재고번호 : "+ inventoryNo);
	}
	
	
	
	
}
