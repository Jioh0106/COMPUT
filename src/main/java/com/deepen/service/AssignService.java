package com.deepen.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.entity.Assignment;
import com.deepen.entity.Request;
import com.deepen.mapper.AssignMapper;
import com.deepen.repository.AssignmentRepository;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class AssignService {
	
	private final CommonDetailRepository cdRepo; //공통상세테이블 
	private final AssignMapper asMapper; //발령매퍼 인터페이스
	private final AssignmentRepository asRepository;
	private final RequestRepository rqRepository;
	private final PersonnelService psService; 
	
	
	
	//JPA
	public void saveAssigmentAndRequest(RequestDTO requestDto, AssignmentDTO assignmentDto) {//requestDto는 html에 있는 requestData값들
		
		//Request 객체생성
		Request request = new Request();
		//요청번호는 자동생성
		request.setEmp_id(requestDto.getEmp_id()); //요청자 사번 (html에서 내가 직접 담음. login기능이 없으니깐)
		//근데 요청자 부서랑 성명은 ??request.setEmp_id(requestDto.getEmp_id())얘가 사원번호니깐 얘를 매개변수로 넣고
		//psService에서 매서드 만들어서? 부서랑 성명을 가져와야하나..?
		// 반려사유는 여기서처리 x
		request.setRequest_status("RQST005"); //요청상태
		request.setComplete("N"); //처리상태
		request.setRequest_type("발령"); //요청유형
		request.setMiddle_approval(requestDto.getMiddle_approval());//중간권한자
		// 요청일과 요청마감일은 @PrePersist에 의해 자동 설정됨(서비스단에서 처리 안해도된다!)
		rqRepository.save(request);
		log.info(request.getRequest_no().toString());
		
		//Assignment 객체생성
		Assignment assignment = new Assignment();
		assignment.setAssign_emp_id(assignmentDto.getAssign_emp_id()); //발령자사번
		assignment.setAssign_type(assignmentDto.getAssign_type()); //발령구분(승진/전보)
		assignment.setAssign_date(assignmentDto.getAssign_date()); //발령일자
		assignment.setPrev_pos(assignmentDto.getPrev_pos()); //이전직급
		assignment.setNew_pos(assignmentDto.getNew_pos()); //발령직급
		assignment.setPrev_dept(assignmentDto.getPrev_dept()); //이전부서
		assignment.setNew_dept(assignmentDto.getNew_dept()); //발령부서
		assignment.setRequest_no(request.getRequest_no()); //요청번호 FK값
		asRepository.save(assignment);
		
		
	}
	
	
	
	//=============================================================================
	
	
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
	
	
	//요청번호로 발령테이블 조회
	public AssignmentDTO selectAssign(Integer request_no){
		return asMapper.selectAssign(request_no);
	}
	

}
