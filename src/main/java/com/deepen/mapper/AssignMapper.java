package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;

@Mapper
@Repository
public interface AssignMapper {
	
	//발령등록페이지에 필요한 공통코드 조회
	List<CommonDetailDTO> selectAssignCommonDetail();
	
	//직원검색 
	List<EmployeesDTO> empSearch(String keyword);
	
	//중간승인권자 조회 모달창
	List<EmployeesDTO> middleRoleSearch();
	
	//최종승인권자 조회 모달창
	List<EmployeesDTO> highRoleSearch();
	
	//요청번호로 발령테이블 조회
	AssignmentDTO selectAssign(@Param("request_no") Integer request_no);
	
	//반려사유 업데이트 및 상태 변경
	 Integer updateRejection(Map<String, Object> paramMap);
	
	
	//반려사유 조회
	RequestDTO getRejection(@Param("request_no") Integer request_no);
	
}
