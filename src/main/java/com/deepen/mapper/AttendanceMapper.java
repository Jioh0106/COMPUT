package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;


@Mapper
@Repository
public interface AttendanceMapper {
	
	List<Map<String, Object>> getAbsenceList();

	List<CommonDetailDTO> getCommonList(String code);

	void insertLoab(Map<String, Object> map);

	List<EmployeesDTO> getEmpList(String emp_role);
	
	
	
	
}
