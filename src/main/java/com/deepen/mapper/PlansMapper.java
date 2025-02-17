package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.PlansDTO;


@Mapper
@Repository
public interface PlansMapper {

	List<PlansDTO> getPlanList();
	
	

	




	
	

	
	

	

	
}
	