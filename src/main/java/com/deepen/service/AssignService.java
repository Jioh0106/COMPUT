package com.deepen.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.mapper.AssignMapper;
import com.deepen.repository.CommonDetailRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class AssignService {
	
	private final CommonDetailRepository cdRepo; //공통상세테이블 
	private final AssignMapper asMapper; //발령매퍼 인터페이스
	
	
	//JPA
	
	
	
	//마이바티스
	//발령등록페이지 공통코드 연결
	public List<CommonDetailDTO> fetchAssignCommonDetail(){
		List<CommonDetailDTO> codeList = asMapper.selectAssignCommonDetail();
		return codeList;
		
	}
	
	//직원검색
	public List<EmployeesDTO> empSearch(String keyword){
		if (keyword == null || keyword.trim().isEmpty()) {
	        // 빈 문자열 또는 null이면 빈 리스트 반환
	        return new ArrayList<>();
	    }
	    // keyword가 있을 때만 Mapper 호출
		return asMapper.empSearch(keyword);
	}
	
	
	//중간승인권자 조회 모달창
	public List<EmployeesDTO> middleRoleSearch(){
		return asMapper.middleRoleSearch();
	}
	
	

}
