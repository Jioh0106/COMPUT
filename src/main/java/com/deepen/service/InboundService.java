package com.deepen.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.deepen.domain.InboundDTO;
import com.deepen.entity.Inbound;
import com.deepen.mapper.InboundMapper;
import com.deepen.repository.InboundRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@Service
public class InboundService {
	
	private final InboundRepository inboundRepository;
    private final InboundMapper inboundMapper;
    
    // 검색 조회
    public List<InboundDTO> getInboundList(Map<String, Object> params) {
        return inboundMapper.selectByConditions(params);
    }
    
    // 품목 검색
    public List<Map<String, Object>> searchItems(String keyword) {
        return inboundMapper.searchItems(keyword);
    }
    
    // 창고 검색
    public List<Map<String, String>> searchWarehouses(String keyword) {
        return inboundMapper.searchWarehouses(keyword);
    }
    
    // 구역 조회
    public List<String> getWarehouseZones(String warehouseCode) {
        String zones = inboundMapper.selectWarehouseZones(warehouseCode);
        if (zones == null || zones.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(zones.trim().split("\\s*,\\s*"));
    }
    
    // 입고 등록
    public void saveInbound(InboundDTO inboundDTO) {
        Inbound inbound = new Inbound();
        BeanUtils.copyProperties(inboundDTO, inbound);
        inbound.setStatus("대기");
        
        inboundRepository.save(inbound);
    }
    
    // 일괄 삭제
    @Transactional
    public void bulkDelete(List<Integer> inNos) {
        inboundRepository.deleteAllById(inNos);
    }
    
    // 일괄 완료
    @Transactional
    public void bulkComplete(List<Integer> inNos) {
    	
        // 현재 로그인한 사용자 정보 가져오기
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth.getName();
        
        List<Inbound> inbounds = inboundRepository.findAllById(inNos);
        
        LocalDate now = LocalDate.now();
        
        inbounds.forEach(inbound -> {
            inbound.setStatus("완료");
            // 승인
            inbound.setReg_user(currentUser);
            inbound.setReg_date(now);
            
            // 재고 처리를 위한 파라미터 맵 생성
            Map<String, Object> params = new HashMap<>();
            params.put("inventory_no", inbound.getInventory_no());
            params.put("warehouse_id", inbound.getWarehouse_id());
            params.put("zone", inbound.getZone());
            params.put("in_qty", inbound.getIn_qty());
            params.put("reg_user", currentUser);
            
            // 재고 처리 로직 추가
            inboundMapper.insertInventory(params);
        });
        
        inboundRepository.saveAll(inbounds);
    }
    
 // 단일 입고 조회
    public InboundDTO getInbound(Integer inNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("inNo", inNo);
        return inboundMapper.selectByConditions(params)
            .stream()
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("해당 입고 정보가 존재하지 않습니다."));
    }
    
    // 입고 수정
    @Transactional
    public void updateInbound(InboundDTO inboundDTO) {
        Inbound inbound = inboundRepository.findById(inboundDTO.getIn_no())
            .orElseThrow(() -> new IllegalArgumentException("해당 입고 정보가 존재하지 않습니다."));
        
        // 필드 업데이트
        inbound.setIn_date(inboundDTO.getIn_date());
        inbound.setIn_qty(inboundDTO.getIn_qty());
        inbound.setWarehouse_id(inboundDTO.getWarehouse_id());
        inbound.setZone(inboundDTO.getZone());
        inbound.setInventory_no(inboundDTO.getInventory_no());
        
        inboundRepository.save(inbound);
    }
}