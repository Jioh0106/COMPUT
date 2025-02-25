package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface ProductionHistoryMapper {
	
	//생산이력 모달
	List<Map<String, Object>> historyList(@Param("plan_id") String plan_id);
	
	//생산계획번호 조회
	List<Map<String, Object>> selectPlanId();
	
}
