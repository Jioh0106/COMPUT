package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface ProcessLineMapper {
	
	// 공정
	List<Map<String, Object>> processInfo(Map<String, Object> searchMap);

	int processInsert(Map<String, Object> saveData);

	int processUpdate(Map<String, Object> saveData);

	int processDelete(Map<String, Object> saveData);
	
	// 라인
	List<Map<String, Object>> lineInfo(Map<String, Object> searchMap);

	int lineInsert(Map<String, Object> saveData);

	int lineUpdate(Map<String, Object> saveData);

	int lineDelete(Map<String, Object> saveData);

}
