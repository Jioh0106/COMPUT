package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.InventoryDTO;

@Mapper
@Repository
public interface InventoryMapper {
	
	//재고현황 조회
	List<InventoryDTO> inventoryStatus();
	
	
	
}
