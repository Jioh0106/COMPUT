package com.deepen.mapper;


import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface MainMapper {

	Map<String, Object> getLoginEmp(String emp_id);
	

}