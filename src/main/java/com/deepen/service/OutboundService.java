package com.deepen.service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.BeanUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.deepen.domain.OutboundDTO;
import com.deepen.entity.Outbound;
import com.deepen.mapper.OutboundMapper;
import com.deepen.repository.OutboundRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class OutboundService {
    
    private final OutboundRepository outboundRepository;
    private final OutboundMapper outboundMapper;
    private final JdbcTemplate jdbcTemplate;
    
    // 출고 목록 조회
    public List<OutboundDTO> getOutboundList(Map<String, Object> params) {
        return outboundMapper.selectByConditions(params);
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
    
    // 재고 수량 체크
    private void checkInventoryQuantity(OutboundDTO outboundDTO) {
        Map<String, Object> params = new HashMap<>();
        params.put("item_no", outboundDTO.getItem_no());
        params.put("warehouse_id", outboundDTO.getWarehouse_id());
        params.put("zone", outboundDTO.getZone());
        
        // 현재 재고 수량 조회
        Integer currentStock = outboundMapper.getCurrentStock(params);
        if (currentStock == null || currentStock < outboundDTO.getOut_qty()) {
            throw new IllegalStateException("재고 수량이 부족합니다.");
        }
    }
    
    // 출고 등록
    @Transactional
    public void saveOutbound(OutboundDTO outboundDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUser = auth.getName();
            
            // DB 세션에 현재 사용자 설정
            jdbcTemplate.execute("BEGIN DBMS_SESSION.SET_IDENTIFIER('empId=" + currentUser + "'); END;");
            
            // 재고 수량 체크
            Map<String, Object> params = new HashMap<>();
            params.put("item_no", outboundDTO.getItem_no());
            params.put("warehouse_id", outboundDTO.getWarehouse_id());
            params.put("zone", outboundDTO.getZone());
            
            log.info("재고 체크 파라미터: " + params);
            
            // 현재 재고 수량 조회
            Integer currentStock = outboundMapper.getCurrentStock(params);
            if (currentStock == null || currentStock < outboundDTO.getOut_qty()) {
                log.info("재고 부족 - 요청 수량: " + outboundDTO.getOut_qty() + ", 현재 재고: " + currentStock);
                throw new IllegalStateException("재고 수량이 부족합니다.");
            }
            
            // 출고 정보 저장
            Outbound outbound = new Outbound();
            BeanUtils.copyProperties(outboundDTO, outbound);
            outbound.setStatus("대기");
            
            // 기본값으로 제품출고 설정
            if (outbound.getSource() == null || outbound.getSource().isEmpty()) {
                outbound.setSource("PSH");  
            }
            
            outboundRepository.save(outbound);
        } catch (Exception e) {
            throw new RuntimeException("출고 처리 중 오류가 발생했습니다.");
        }
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
        
        // DB 세션에 현재 사용자 설정
        jdbcTemplate.execute("BEGIN DBMS_SESSION.SET_IDENTIFIER('empId=" + currentUser + "'); END;");
        
        List<Outbound> outbounds = outboundRepository.findAllById(outNos);
        
        // 모든 출고건의 총 재고 필요량을 warehouse_id + zone + inventory_no 별로 집계
        Map<String, Integer> totalNeededStock = new HashMap<>();
        outbounds.forEach(outbound -> {
            String key = outbound.getWarehouse_id() + "_" + 
                    (outbound.getZone() != null ? outbound.getZone() : "null") + "_" + 
                    outbound.getItem_no();
            totalNeededStock.merge(key, outbound.getOut_qty(), Integer::sum);
        });
        
        // 각 창고별 현재 재고 확인
        for (Map.Entry<String, Integer> entry : totalNeededStock.entrySet()) {
            String[] keys = entry.getKey().split("_");
            Map<String, Object> params = new HashMap<>();
            params.put("warehouse_id", keys[0]);
            params.put("zone", "null".equals(keys[1]) ? null : keys[1]);
            params.put("item_no", Integer.parseInt(keys[2]));
            
            Integer currentStock = outboundMapper.getCurrentStock(params);
            if (currentStock == null || currentStock < entry.getValue()) {
                throw new IllegalStateException(
                        String.format("재고 부족 - 창고: %s, 구역: %s, 품목번호: %s, 필요수량: %d, 현재재고: %d",
                                keys[0],
                                "null".equals(keys[1]) ? "없음" : keys[1],
                                keys[2],
                                entry.getValue(),
                                currentStock != null ? currentStock : 0));
            }
        }
        
        // 모든 재고 확인이 완료된 후 출고 처리
        outbounds.forEach(outbound -> {
            outbound.setStatus("완료");
            outbound.setReg_user(currentUser);
            outbound.setReg_date(LocalDate.now());
            
            Map<String, Object> params = new HashMap<>();
            params.put("item_no", outbound.getItem_no());
            params.put("warehouse_id", outbound.getWarehouse_id());
            params.put("zone", outbound.getZone());
            params.put("out_qty", outbound.getOut_qty());
            
            outboundMapper.updateInventory(params);
        });
        
        outboundRepository.saveAll(outbounds);
    }
}