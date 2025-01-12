package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;


@Mapper
@Repository
public interface AbsenceMapper {
	
	List<Map<String, Object>> getAbsenceList();

	List<CommonDetailDTO> getCommonList(String code);

	void insertLoab(Map<String, Object> map);

	List<Map<String, String>> getEmpList(String emp_role);

	int insertRequest(Map<String, Object> map);

	void deleteAbsences(List<Integer> deleteList);

	void updateAbsence(Map<String, Object> row);
	
	void insertAbsence(Map<String, Object> row);

	Map<String, String> getEmpSelf(String emp_id);



	

	
}
	