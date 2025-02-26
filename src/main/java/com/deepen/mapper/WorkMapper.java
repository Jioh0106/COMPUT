package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.WorkDTO;
import com.deepen.domain.WorkTmpDTO;


@Mapper
@Repository
public interface WorkMapper {

	List<Map<String, String>> getEmpSerch(Map<String, String> serchEmpInfo);

	WorkDTO ckeckWork(@Param("emp_id") String emp_id, @Param("day") String day);

	void insertWork(WorkDTO work);

	List<WorkDTO> getWorkList(Map<String, String> map);

	List<WorkDTO> getWorkListSerch(Map<String, String> map);

	List<WorkTmpDTO> getWorkTmpList();

	List<Map<String, Object>> getLoabList(Map<String, String> map);

	List<Map<String, Object>> getVctnList(Map<String, String> map);

	Map<String, Object> checkVctn(@Param("day") String day, @Param("emp_id") String emp_id);



	
	

	

	
}
	