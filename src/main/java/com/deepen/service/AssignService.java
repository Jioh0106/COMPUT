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
import com.deepen.entity.Employees;
import com.deepen.entity.Request;
import com.deepen.mapper.AssignMapper;
import com.deepen.repository.AssignmentRepository;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.PersonnelRepository;
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
	private final PersonnelRepository personnelRepository;
	
	
	//JPA
	
	
	// 로그인한 사용자 정보 조회
	public Optional<Employees> findById(String emp_id) {
			return personnelRepository.findById(emp_id);
		}
	
	//발령테이블, 요청테이블 등록
	public Integer saveAssigmentAndRequest(RequestDTO requestDto, 
			AssignmentDTO assignmentDto,String emp_id, String role) {//requestDto는 html에 있는 requestData값들
		
		//Request 객체생성
		Request request = new Request();
		//요청번호는 자동생성
		request.setEmp_id(emp_id);
		// 반려사유는 여기서처리 x

		request.setRequest_type("발령"); //요청유형
//		request.setMiddle_approval(requestDto.getMiddle_approval());//중간권한자
		
		
		   // **권한에 따른 요청 상태 및 승인자 설정**
	    switch (role) {
	        case "ATHR001": // 최종 권한자
	            request.setRequest_status("RQST005"); // 요청 상태: 최종승인 
	            request.setHigh_approval(emp_id);     // 최종 승인자: 본인사번
	            //발령테이블 최종승인날짜(오늘날짜) 컬럼도 insert 해야함.
	            break;

	        case "ATHR002": // 중간 권한자
	            request.setRequest_status("RQST003"); // 요청 상태: 2차대기
	            request.setMiddle_approval(emp_id);   // 중간 승인자: 본인사번
	            request.setHigh_approval(requestDto.getHigh_approval());//최종승인권자사번
	            break;

	        case "ATHR003": // 일반 사원
	        default:
	            request.setRequest_status("RQST001"); // 요청 상태: 1차대기
	            request.setMiddle_approval(requestDto.getMiddle_approval());//중간권한자사번
	            break;
	    }

		
		// 요청일과 요청마감일은 @PrePersist에 의해 자동 설정됨(서비스단에서 처리 안해도된다!)
		rqRepository.save(request);
		log.info("생성된 요청번호: " + request.getRequest_no());
		
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
		
		return request.getRequest_no();
		
	}
	
	
	//수신발신 처리
	public RequestDTO getRequestDivision(String emp_id, Integer request_no) {
		
		Request request = rqRepository.findById(request_no).get();
		
//		// 중간 승인권자 및 최종 승인권자 사번 추출
//		String middleApprovalEmpId = (request.getMiddle_approval());
//		String finalApprovalEmpId = (request.getHigh_approval() != null) ? (request.getHigh_approval()) : null;
//		
//		RequestDTO requestDto = new RequestDTO();
//		if(emp_id.equals(request.getEmp_id())) { //요청구분(발신,수신)
//			requestDto.setRequest_division("발신");
//		}else if(emp_id.equals(middleApprovalEmpId) || emp_id.equals(finalApprovalEmpId)){
//			requestDto.setRequest_division("수신");
//		}
//		
//		
//		 
//		return requestDto;
		  // 중간 승인권자 및 최종 승인권자 사번 추출
	    String middleApprovalEmpId = request.getMiddle_approval();
	    String finalApprovalEmpId = request.getHigh_approval();
	    
	    // 요청 상태 추출
	    String requestStatus = request.getRequest_status();

	    RequestDTO requestDto = new RequestDTO();

	    // 요청자가 본인인 경우 항상 발신으로 간주
	    if (emp_id.equals(request.getEmp_id())) { 
	        requestDto.setRequest_division("발신");
	    } 
	    // 중간 승인자가 수신자로 간주될 경우 (상태가 RQST003인 경우에만 수신)
	    else if (emp_id.equals(middleApprovalEmpId) && "RQST003".equals(requestStatus)) {
            requestDto.setRequest_division("발신");
        } 
	    else if(emp_id.equals(middleApprovalEmpId) && "RQST001".equals(requestStatus)) {
	    	 requestDto.setRequest_division("수신");
	    }
	    // 최종 승인자가 수신자로 간주될 경우 (상태가 RQST005인 경우에만 수신)
	    else if (emp_id.equals(finalApprovalEmpId) && "RQST003".equals(requestStatus)) {
	        requestDto.setRequest_division("수신");
	    } 
	    // 그 외의 경우 발신으로 간주
	    else {
	        requestDto.setRequest_division("발신");
	    }

	    return requestDto;
		
		
		
		
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
	
	
	//최종승인권자 조회 모달창
	public List<EmployeesDTO> highRoleSearch(){
		return asMapper.highRoleSearch();
	}
	
	//요청번호로 발령테이블 조회
	public AssignmentDTO selectAssign(Integer request_no){
		return asMapper.selectAssign(request_no);
	}
	

}
