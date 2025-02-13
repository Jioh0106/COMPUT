package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.InboundDTO;
import com.deepen.entity.Inbound;

@Mapper
@Repository
public interface InboundMapper {
	
	// 조건부 검색 (JOIN 필요)
    List<InboundDTO> selectByConditions(Map<String, Object> params);
    
    // 품목 검색 (UNION 필요)
    List<Map<String, Object>> searchItems(String keyword);
    
    // 창고 검색
    List<Map<String, String>> searchWarehouses(String keyword);
    
    // 구역 조회
    String selectWarehouseZones(String warehouseCode);
	
    // 재고 처리
    void insertInventory(Map<String, Object> params);
}