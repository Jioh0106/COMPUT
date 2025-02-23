package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface EquipmentInfoMapper {

	List<Map<String, Object>> yearMonthList();
	
	List<Map<String, Object>> equipmentInfo(Map<String, Object> searchMap);
	
	List<Map<String, Object>> clientInfo();
	
	List<Map<String, Object>> kindInfo();

	List<Map<String, Object>> lineInfo();
	
	int eqpInsert(Map<String, Object> saveDataList);

	int eqpUpdate(Map<String, Object> saveDataList);

	int eqpDelete(Map<String, Object> saveData);

}
