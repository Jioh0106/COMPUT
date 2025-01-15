package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface VacationMapper {

	Map<String, Object> selectEmpAthr(String userId);
	
	List<Map<String, Object>> selectUseVctnList(Map<String, Object> athrMapList);
	
	List<Map<String, Object>> selectVctnDaysList(Map<String, Object> athrMapList);
	
	List<Map<String, Object>> selectCommonDtl();

	Map<String, Object> selectEmpInfo(String userId);

	List<Map<String, Object>> selectMiddleAprvr();

	int insertRequest(Map<String, Object> map);

	int insertVctn(Map<String, Object> map);

	Map<String, Object> vctnDays(String emp_id);


}