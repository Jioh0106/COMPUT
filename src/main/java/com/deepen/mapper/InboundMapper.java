package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.InboundDTO;

@Mapper
@Repository
public interface InboundMapper {
	
	//재고 처리
    @Options(useGeneratedKeys = true, keyProperty = "inventory_no")
    void insertInventory(Map<String, Object> params);
	
	// 조건부 검색 (JOIN 필요)
    List<InboundDTO> selectByConditions(Map<String, Object> params);
    
    // 품목 검색 (UNION 필요)
    List<Map<String, Object>> searchItems(String keyword);
    
    // 창고 검색
    List<Map<String, Object>> searchWarehouses(@Param("keyword") String keyword, 
                                               @Param("itemNo") int itemNo,
                                               @Param("itemType") String itemType);
    
    // 구역 조회
    List<String> selectWarehouseZones(@Param("warehouseCode") String warehouseCode, 
    								  @Param("itemNo") int itemNo);
	
}