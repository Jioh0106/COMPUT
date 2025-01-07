package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface CommonMapper {

	List<Map<String, Object>> commonList();

	List<Map<String, Object>> commonDtlList(String commonCd);

}
