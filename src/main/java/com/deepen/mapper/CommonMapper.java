package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.entity.CommonDetail;


@Mapper
@Repository
public interface CommonMapper {
	

	List<Map<String, Object>> commonList();
	
	
	
	
}
