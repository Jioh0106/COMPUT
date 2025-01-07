package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;

@Mapper
@Repository
public interface AssignMapper {
	
	//발령등록페이지에 필요한 공통코드 조회
	List<CommonDetailDTO> selectAssignCommonDetail();
	
	//직원검색 
	List<EmployeesDTO> empSearch(String keyword);
	
	//중간승인권자 조회 모달창
	List<EmployeesDTO> middleRoleSearch();
	
	
	
}
