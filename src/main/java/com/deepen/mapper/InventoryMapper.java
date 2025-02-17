package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.InventoryDTO;
import com.deepen.domain.WarehouseDTO;

@Mapper
@Repository
public interface InventoryMapper {
	
	//재고현황 조회
	List<InventoryDTO> inventoryStatus(@Param("warehouse_id")String warehouse_id, @Param("zone")String zone,
			@Param("item_name")String item_name);
	
	//창고 조회
	List<WarehouseDTO> warehouseSelect();
	
	//구역 조회
	String zoneSelect(@Param("warehouse_id")String warehouse_id);
	

	
	
}
