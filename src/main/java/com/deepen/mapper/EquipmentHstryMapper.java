package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface EquipmentHstryMapper {
//
	List<Map<String, Object>> yearMonthList();
	
	List<Map<String, Object>> equipmentInfo(Map<String, Object> searchMap);
	
	List<Map<String, Object>> selectStts();

	int eqpInsert(Map<String, Object> saveDataList);

	int eqpUpdate(Map<String, Object> saveDataList);

	int eqpDelete(Map<String, Object> saveData);

	List<Map<String, Object>> equipmentHstry(Map<String, Object> searchMap);

}
