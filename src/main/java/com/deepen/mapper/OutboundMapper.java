package com.deepen.mapper;


import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.OutboundDTO;
import com.deepen.entity.Outbound;

@Mapper
@Repository
public interface OutboundMapper {
	
	// 조건부 검색
    List<OutboundDTO> selectByConditions(Map<String, Object> params);
    
    // 재고가 있는 품목 검색
    List<Map<String, Object>> searchItemsWithStock(String keyword);
    
    // 특정 품목의 재고가 있는 창고 검색
    List<Map<String, Object>> searchWarehousesWithStock(Map<String, Object> params);
    
    // 현재 재고 수량 조회
    Integer getCurrentStock(Map<String, Object> params);
    
    // 재고 차감
    void updateInventory(Map<String, Object> params);
    
    // 구역 조회
    String selectWarehouseZones(String warehouseCode);

}