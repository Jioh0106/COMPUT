package com.deepen.mapper;


import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface CommuteMapper {

	Map<String, Object> selectEmpAthr(String userId);

	List<Map<String, Object>> selectAthrList(String athr);

	List<Map<String, Object>> selectCmtList(Map<String, Object> athrMapList);

	List<Map<String, Object>> selectWorkList(Map<String, Object> searchMap);

	int insertCmt(Map<String, Object> cmtData);

}