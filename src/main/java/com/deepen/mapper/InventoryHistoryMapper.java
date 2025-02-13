package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface InventoryHistoryMapper {
	
	//변경사유 공통코드
	List<Map<String, Object>> reasonChangeList();
	
	//특정재고번호 변경이력 조회
	List<Map<String, Object>> historyList(@Param ("inventory_no") Integer inventory_no);
	
}
