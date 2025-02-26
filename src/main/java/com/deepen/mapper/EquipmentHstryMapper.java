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

	List<Map<String, Object>> equipmentHstry(Map<String, Object> searchMap);

	int insert(Map<String, Object> saveData);

	int update(Map<String, Object> saveData);

	int delete(Map<String, Object> saveData);

	void updateStts(Map<String, Object> saveData);

}
