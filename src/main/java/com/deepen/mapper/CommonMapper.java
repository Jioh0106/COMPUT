package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDTO;

@Mapper
@Repository
public interface CommonMapper {

	List<Map<String, Object>> commonList(Map<String, Object> map);

	List<Map<String, Object>> commonDtlList(Map<String, Object> map);

	int insertCommonList(CommonDTO common);

	int insertDetailList(CommonDTO common);

	int updateCommonList(CommonDTO dto);

	int updateDetailList(CommonDTO dto);

}
