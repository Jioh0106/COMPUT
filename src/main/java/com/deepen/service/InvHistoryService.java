package com.deepen.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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
	
	
	//변경이력 테이블 새로운 트랜잭션에서 실행 - (s-rock 충돌방지를 위해-> FK때문에 발생함)
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void saveInventoryHistoryRecord(InvHistory invHistory) {
		invhRepository.save(invHistory);
	}
	
	//재고현황 테이블 즉시 commit 새로운 트랜잭션에서 실행
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void saveInventoryRecord(Inventory inventory) {
		ivReposiotry.save(inventory);
	}
	
	
	//변경이력 테이블 insert, 재고현황 테이블 update
	@Transactional
	public void saveInventoryHistory(List<InvHistoryDTO> invhDtoList) {
		for(InvHistoryDTO dto : invhDtoList) {
			
			boolean success = false;
		    int retryCount = 0;
		    
		  while (!success && retryCount < 3) {
		    try{
		    
		    log.info("재고번호 :"+ dto.getInventory_no());
		    	 
			InvHistory invHistory = new InvHistory();
			invHistory.setInventory_no(dto.getInventory_no()); //재고번호 FK 넣어줌
			
			//최신 재고현황데이터 조회
			Optional<Inventory> optInventory = ivReposiotry.findById(dto.getInventory_no());
			Inventory inventory = optInventory.get();
			
			//변경이력 테이블에 isnert
			invHistory.setPrev_count(inventory.getInventory_count()); //최신 재고현황의 실재고량 값을 넣어줌!!
			invHistory.setNew_count(dto.getNew_count());
			invHistory.setMod_user(dto.getMod_user());
			invHistory.setChange_reason(dto.getChange_reason());
			invHistory.setReason_detail(dto.getReason_detail());
			invHistory.setMod_date(LocalDateTime.now());
			invHistory.setDiff_count(dto.getNew_count() - inventory.getInventory_count());//변경후실재고량 - 실재고량(재고현황테이블)
			
			saveInventoryHistoryRecord(invHistory); //변경이력 저장 후 commit
			
			
			//재고현황 테이블 업데이트
			inventory.setInventory_qty(invHistory.getNew_count()); //재고량
			inventory.setInventory_count(invHistory.getNew_count()); //실재고량
			inventory.setInventory_change_date(invHistory.getMod_date()); //재고량변경일
			
			saveInventoryRecord(inventory); //재고현황 저장 후 commit - 별도의 트랜잭션에서 실행
			
			
			 success = true; //성공하면 while문 종료 
			
	     	} catch (ObjectOptimisticLockingFailureException e) {
		    	 retryCount++;
                 log.info("동시성 충돌 발생 - 재시도 횟수: " + retryCount);
                 
                 if (retryCount >= 3) {
                     throw new RuntimeException("동시성 충돌로 인해 재고 업데이트 실패");
                 }
                 
			  }//try catch문 
		    }//while문
		}//for문
		    
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
