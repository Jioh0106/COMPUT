package com.deepen.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;  // JdbcTemplate 주입 추가
    
    // DB 세션에 현재 사용자 ID 설정하는 메서드 추가
    public void setCurrentUserInDbSession() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String empId = auth.getName();
            jdbcTemplate.execute("BEGIN DBMS_SESSION.SET_IDENTIFIER('empId=" + empId + "'); END;");
        }
    }
    
    private String determineItemType(int itemNo) {
    	boolean isProduct = inboundMapper.isProductItem(itemNo) > 0;
    	return isProduct ? "완제품" : "자재";
    }
    
    // 검색 조회
    public List<InboundDTO> getInboundList(Map<String, Object> params) {
        return inboundMapper.selectByConditions(params);
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
    
    // 품목 검색
    public List<Map<String, Object>> searchItems(String keyword) {
        return inboundMapper.searchItems(keyword);
    }
    
    // 창고 검색
    public List<Map<String, Object>> searchWarehouses(String keyword, int itemNo, String itemType) {
    	if(itemType == null || itemType.isEmpty()) {
    		itemType = determineItemType(itemNo);
    	}
        return inboundMapper.searchWarehouses(keyword, itemNo, itemType);
    }
    
    // 구역 조회
    public List<String> getWarehouseZones(String warehouseCode, int itemNo) {
        List<String> zones = inboundMapper.selectWarehouseZones(warehouseCode, itemNo);
        return zones != null ? zones : new ArrayList<>();
    }
    
    // 입고 등록
    public void saveInbound(InboundDTO inboundDTO) {
        Inbound inbound = new Inbound();
        BeanUtils.copyProperties(inboundDTO, inbound);
        inbound.setStatus("대기");
        inboundRepository.save(inbound);
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
        inbound.setItem_no(inboundDTO.getItem_no());
        
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth.getName();
        
        jdbcTemplate.execute("BEGIN DBMS_SESSION.SET_IDENTIFIER('empId=" + currentUser + "'); END;");
        
        List<Inbound> inbounds = inboundRepository.findAllById(inNos);
        List<String> errorMessages = new ArrayList<>();
        
        // 창고명과 품목명 조회를 위한 매핑
        Map<String, String> warehouseNames = new HashMap<>();
        Map<Integer, String> itemNames = new HashMap<>();
        
        // 창고명 조회
        String warehouseIds = inbounds.stream()
            .map(Inbound::getWarehouse_id)
            .distinct()
            .collect(Collectors.joining("','", "'", "'"));
        
        jdbcTemplate.query(
            "SELECT warehouse_id, warehouse_name FROM WAREHOUSE WHERE warehouse_id IN (" + warehouseIds + ")",
            (rs) -> {
                warehouseNames.put(
                    rs.getString("warehouse_id"), 
                    rs.getString("warehouse_name")
                );
            }
        );
        
        // 품목명 조회
        String itemQuery = """
            SELECT p.product_no as item_no, p.product_name as item_name 
            FROM PRODUCT p 
            WHERE p.product_no IN (%s)
            UNION ALL
            SELECT m.mtr_no as item_no, m.mtr_name as item_name 
            FROM MATERIAL m 
            WHERE m.mtr_no IN (%s)
        """;
        
        String itemNos = inbounds.stream()
            .map(i -> String.valueOf(i.getItem_no()))
            .collect(Collectors.joining(","));
        
        jdbcTemplate.query(
            String.format(itemQuery, itemNos, itemNos),
            (rs) -> {
                itemNames.put(
                    rs.getInt("item_no"), 
                    rs.getString("item_name")
                );
            }
        );

        // 입고 항목들을 창고별, 품목별로 그룹화하여 검증
        Map<String, Map<String, Object>> validationInfo = new HashMap<>();
        
        // 각 입고건별 검증
        for (Inbound inbound : inbounds) {
            // 구역 미정 체크
            if (inbound.getZone() == null || 
                inbound.getZone().trim().isEmpty() || 
                "미정".equals(inbound.getZone().trim())) {
                errorMessages.add(String.format(
                    "품목 '%s'의 구역이 미정인 상태입니다.",
                    itemNames.get(inbound.getItem_no())
                ));
                continue;
            }
            
            String key = inbound.getWarehouse_id() + "_" + inbound.getItem_no();
            Map<String, Object> info = validationInfo.computeIfAbsent(key, k -> new HashMap<>());
            
            // 입고하려는 구역 정보 수집
            Set<String> zones = (Set<String>) info.computeIfAbsent("zones", k -> new HashSet<String>());
            zones.add(inbound.getZone());
            
            // 기존 재고 정보가 아직 없는 경우에만 조회
            if (!info.containsKey("existing")) {
                List<Map<String, Object>> inventories = inboundMapper.checkExistingInventory(
                    inbound.getItem_no(), 
                    inbound.getWarehouse_id()
                );
                if (!inventories.isEmpty()) {
                    info.put("existing", inventories.get(0));
                }
            }
            
            info.put("warehouseName", warehouseNames.get(inbound.getWarehouse_id()));
            info.put("itemName", itemNames.get(inbound.getItem_no()));
        }
        
        // 수집된 정보를 바탕으로 검증
        for (Map<String, Object> info : validationInfo.values()) {
            Set<String> zones = (Set<String>) info.get("zones");
            String warehouseName = (String) info.get("warehouseName");
            String itemName = (String) info.get("itemName");
            
            // 여러 구역 입고 시도 체크
            if (zones.size() > 1) {
                errorMessages.add(String.format(
                    "품목 '%s'을(를) 창고 '%s'에 여러 구역(%s)으로 입고할 수 없습니다.",
                    itemName,
                    warehouseName,
                    String.join(", ", zones)
                ));
                continue;
            }
            
            // 기존 재고와 구역 불일치 체크
            Map<String, Object> existing = (Map<String, Object>) info.get("existing");
            if (existing != null) {
                String existingZone = (String) existing.get("ZONE");
                String newZone = zones.iterator().next();
                
                if (!existingZone.equals(newZone)) {
                    errorMessages.add(String.format(
                        "품목 '%s'은(는) 창고 '%s'의 구역 '%s'에 이미 재고(수량: %s)가 존재합니다. " +
                        "현재 입고하려는 구역('%s')이 기존 구역과 다릅니다.",
                        itemName,
                        warehouseName,
                        existingZone,
                        existing.get("INVENTORY_QTY"),
                        newZone
                    ));
                }
            }
        }
        
        // 에러가 있으면 예외 발생
        if (!errorMessages.isEmpty()) {
            throw new IllegalStateException(String.join("\n\n", errorMessages));
        }
        
        // 검증을 통과한 경우 입고 처리
        LocalDate now = LocalDate.now();
        
        inbounds.forEach(inbound -> {
            inbound.setStatus("완료");
            inbound.setReg_user(currentUser);
            inbound.setReg_date(now);
            
            Map<String, Object> params = new HashMap<>();
            params.put("item_no", inbound.getItem_no());
            params.put("warehouse_id", inbound.getWarehouse_id());
            params.put("zone", inbound.getZone());
            params.put("in_qty", inbound.getIn_qty());
            params.put("reg_user", currentUser);
            
            inboundMapper.insertInventory(params);
        });
        
        inboundRepository.saveAll(inbounds);
    }
}