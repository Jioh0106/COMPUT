package com.deepen.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.deepen.domain.OutboundDTO;
import com.deepen.entity.Outbound;
import com.deepen.mapper.OutboundMapper;
import com.deepen.repository.OutboundRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class OutboundService {
	
	private final OutboundRepository outboundRepository;
    private final OutboundMapper outboundMapper;
    
    // 출고 목록 조회
    public List<OutboundDTO> getOutboundList(Map<String, Object> params) {
        return outboundMapper.selectByConditions(params);
    }
    
    // 품목 검색 (재고 포함)
    public List<Map<String, Object>> searchItemsWithStock(String keyword) {
        return outboundMapper.searchItemsWithStock(keyword);
    }
    
    // 창고 검색 (재고 포함)
    public List<Map<String, Object>> searchWarehousesWithStock(String keyword, Integer itemNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("itemNo", itemNo);
        return outboundMapper.searchWarehousesWithStock(params);
    }
    
    // 단일 출고 조회
    public OutboundDTO getOutbound(Integer outNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("outNo", outNo);
        return outboundMapper.selectByConditions(params)
            .stream()
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("해당 출고 정보가 존재하지 않습니다."));
    }
    
    // 출고 등록
    @Transactional
    public void saveOutbound(OutboundDTO outboundDTO) {
    	
    	  // 재고 수량 체크
        Map<String, Object> params = new HashMap<>();
        params.put("inventory_no", outboundDTO.getInventory_no());
        params.put("warehouse_id", outboundDTO.getWarehouse_id());
        params.put("zone", outboundDTO.getZone());
        
        // 현재 재고 수량 조회
        Integer currentStock = outboundMapper.getCurrentStock(params);
        if (currentStock == null || currentStock < outboundDTO.getOut_qty()) {
            throw new IllegalStateException("재고 수량이 부족합니다.");
        }
        
        // 출고 정보 저장
        Outbound outbound = new Outbound();
        BeanUtils.copyProperties(outboundDTO, outbound);
        outbound.setStatus("대기");
        
        outboundRepository.save(outbound);
    }
    
    // 재고 수량 체크
    private void checkInventoryQuantity(OutboundDTO outboundDTO) {
        Map<String, Object> params = new HashMap<>();
        params.put("itemNo", outboundDTO.getInventory_no());
        params.put("warehouseId", outboundDTO.getWarehouse_id());
        params.put("zone", outboundDTO.getZone());
        
        // 현재 재고 수량 조회
        Integer currentStock = outboundMapper.getCurrentStock(params);
        if (currentStock == null || currentStock < outboundDTO.getOut_qty()) {
            throw new IllegalStateException("재고 수량이 부족합니다.");
        }
    }
    
    // 일괄 삭제
    @Transactional
    public void bulkDelete(List<Integer> outNos) {
        outboundRepository.deleteAllById(outNos);
    }
    
    // 출고 완료 처리
    @Transactional
    public void completeOutbound(List<Integer> outNos) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth.getName();
        
        List<Outbound> outbounds = outboundRepository.findAllById(outNos);
        
        outbounds.forEach(outbound -> {
            outbound.setStatus("완료");
            outbound.setReg_user(currentUser);
            outbound.setReg_date(LocalDate.now());
            
            // 재고 수량 체크 및 업데이트용 파라미터 설정
            Map<String, Object> params = new HashMap<>();
            params.put("inventory_no", outbound.getInventory_no());  // 파라미터명 수정
            params.put("warehouse_id", outbound.getWarehouse_id());  // 파라미터명 수정
            params.put("zone", outbound.getZone());
            params.put("out_qty", outbound.getOut_qty());  // 파라미터명 수정
            
            // 재고 수량 체크
            Integer currentStock = outboundMapper.getCurrentStock(params);
            if (currentStock == null || currentStock < outbound.getOut_qty()) {
                throw new IllegalStateException("재고 수량이 부족합니다.");
            }
            
            // 재고 차감
            outboundMapper.updateInventory(params);
        });
        
        outboundRepository.saveAll(outbounds);
    }
    
    // 출고 수정
    @Transactional
    public void updateOutbound(OutboundDTO outboundDTO) {
        Outbound outbound = outboundRepository.findById(outboundDTO.getOut_no())
            .orElseThrow(() -> new IllegalArgumentException("해당 출고 정보가 존재하지 않습니다."));
        
        // 수량이 변경된 경우 재고 체크
        if (outbound.getOut_qty() != outboundDTO.getOut_qty()) {
            checkInventoryQuantity(outboundDTO);
        }
        
        outbound.setOut_date(outboundDTO.getOut_date());
        outbound.setOut_qty(outboundDTO.getOut_qty());
        outbound.setWarehouse_id(outboundDTO.getWarehouse_id());
        outbound.setZone(outboundDTO.getZone());
        
        outboundRepository.save(outbound);
    }
}