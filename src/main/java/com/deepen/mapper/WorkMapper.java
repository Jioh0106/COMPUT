package com.deepen.mapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.WorkDTO;
import com.deepen.entity.WorkTmp;


@Mapper
@Repository
public interface WorkMapper {

	List<Map<String, String>> getEmpSerch(Map<String, String> serchEmpInfo);

	WorkDTO ckeckWork(@Param("emp_id") String emp_id, @Param("day") String day);
	
	

	

	
}
	