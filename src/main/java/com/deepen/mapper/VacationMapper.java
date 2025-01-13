package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface VacationMapper {

	List<Map<String, Object>> selectCommonDtl();

	Map<String, Object> selectEmpInfo(String userId);

	List<Map<String, Object>> selectMiddleAprvr();

}