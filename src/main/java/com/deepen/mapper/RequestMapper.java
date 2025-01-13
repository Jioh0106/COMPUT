package com.deepen.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface RequestMapper {

	Map<String, Object> getAbsenceWithRequest(int request_no);
	
	


	

	
}
	