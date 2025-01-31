package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface ProcessLineMapper {

	List<Map<String, Object>> yearMonthList();
	
	List<Map<String, Object>> equipmentInfo(Map<String, Object> searchMap);

	int eqpInsert(Map<String, Object> saveDataList);

	int eqpUpdate(Map<String, Object> saveDataList);

	int eqpDelete(Map<String, Object> saveData);

}
