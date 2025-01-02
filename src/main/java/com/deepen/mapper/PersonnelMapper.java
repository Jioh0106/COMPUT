package com.deepen.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;


@Mapper
@Repository
public interface PersonnelMapper {
	
	// 필요 공통 코드 조회
	 CommonDetailDTO getCodeNameByCode(); 
	
}
