package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;


@Mapper
@Repository
public interface PersonnelMapper {
	
	// 등록페이지 필요 공통 코드 조회
	 List<CommonDetailDTO> selectCommonDetailCodeList();
	 
	 List<Map<String, Object>> selectEmpList(Map<String, Object> params);
	 
	 
	
}
