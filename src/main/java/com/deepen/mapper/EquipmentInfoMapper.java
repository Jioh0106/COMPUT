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

	//int saveData(List<Map<String, Object>> saveDataList);

}
