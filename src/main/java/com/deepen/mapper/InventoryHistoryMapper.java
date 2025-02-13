package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface InventoryHistoryMapper {
	
	//변경사유 공통코드
	List<Map<String, Object>> reasonChangeList();
	
	
}
