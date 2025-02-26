package com.deepen.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.entity.Assignment;
import com.deepen.entity.CommonDetail;
import com.deepen.entity.Employees;
import com.deepen.entity.Request;
import com.deepen.mapper.AssignMapper;
import com.deepen.repository.AssignmentRepository;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.PersonnelRepository;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@EnableScheduling
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
		request.setIs_checked("N"); //토스트알림 체크 컬럼
		
		
		   // **권한에 따른 요청 상태 및 승인자 설정**
	    switch (role) {
	        case "ATHR001": // 최종 권한자
	            request.setRequest_status("RQST005"); // 요청 상태: 최종승인 
	            request.setHigh_approval(emp_id);     // 최종 승인자: 본인사번
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
		
		//테이블에(이전부서, 이전직급이)이름값으로 들어가서 공통코드로 바꿈
		String commonCodeDept = cdRepo.findCommonDetailCodeByName(assignmentDto.getPrev_dept());
		assignment.setPrev_dept(commonCodeDept); //이전부서 - 사원
		String commonCodePos = cdRepo.findCommonDetailCodeByName(assignmentDto.getPrev_pos());
		assignment.setPrev_pos(commonCodePos); //이전직급 - 개발
		log.info("이전직급!!!"+commonCodePos);
		
		assignment.setNew_pos(assignmentDto.getNew_pos()); //발령직급
		assignment.setNew_dept(assignmentDto.getNew_dept()); //발령부서
		assignment.setRequest_no(request.getRequest_no()); //요청번호 FK값
		
		if("ATHR001".equals(role)){
			assignment.setRegistr_date(LocalDateTime.now());
		}
		asRepository.save(assignment);
		
		return request.getRequest_no();
		
	}
	
	
	//수신발신 처리
	public RequestDTO getRequestDivision(String emp_id, Integer request_no) {
		
		Request request = rqRepository.findById(request_no).get();

		  // 중간 승인권자 및 최종 승인권자 사번 추출
	    String middleApprovalEmpId = request.getMiddle_approval();
	    String finalApprovalEmpId = request.getHigh_approval();
	    
	    // 요청 상태 추출
	    String requestStatus = request.getRequest_status();

	    RequestDTO requestDto = new RequestDTO();

	    // 요청자가 본인인 경우 항상 발신으로 간주
	
	    if (emp_id.equals(finalApprovalEmpId) && ("RQST003".equals(requestStatus) || "RQST005".equals(requestStatus) || "RQST004".equals(requestStatus))) {
	        requestDto.setRequest_division("수신");
	    } 
	    
	    else if (emp_id.equals(middleApprovalEmpId) && "RQST001".equals(requestStatus)) {
	        requestDto.setRequest_division("수신");
	    } 
	   
	    else if (emp_id.equals(middleApprovalEmpId) && "RQST003".equals(requestStatus)) {
	        requestDto.setRequest_division("발신");
	    } 
	   
	    else if (emp_id.equals(request.getEmp_id())) { 
	        requestDto.setRequest_division("발신");
	    } 
	   
	    else {
	        requestDto.setRequest_division("발신");
	    }

	    return requestDto;
		
		
	}
	
	

	//발령일자에 -> 사원테이블 부서명, 직급 업데이트
	@Scheduled(fixedRate = 600000)//10분마다 실행 
	public void employeeUpdate() {
		List<Assignment> assign = asRepository.findAll();
		LocalDateTime now = LocalDateTime.now();
		
		for(Assignment assignment :assign) {
			LocalDateTime registr_date = assignment.getRegistr_date();
			
			String emp_id = assignment.getAssign_emp_id(); //발령자사번
			if(registr_date != null && registr_date.toLocalDate().isEqual(now.toLocalDate())) {
				Optional<Employees> optionnalEmployees = personnelRepository.findById(emp_id);
				Employees employees = optionnalEmployees.get();
				employees.setEmp_position(assignment.getNew_pos());
				employees.setEmp_dept(assignment.getNew_dept());
				
				personnelRepository.save(employees); //사원테이블 저장
				log.info("해당 발령자 사번 업데이트"+ emp_id);
				
			}else if(registr_date == null) {
				log.info("최종승인이 아니라서 등록날짜없음 "+ emp_id);
			}else {
				log.info("오늘 등록된 발령 항목이 아님: " + emp_id);
			}
		}
		
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
	
	 // 반려사유 등록 및 상태 변경
    public boolean updateRejection(Integer request_no, String request_rejection) {
    	Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("request_no", request_no);
        paramMap.put("request_rejection", request_rejection);

        int updatedRows = asMapper.updateRejection(paramMap);
        return updatedRows > 0; // 성공 여부 반환
    }
	
	//반려사유 조회
	public RequestDTO getRejection(Integer request_no) {
		return asMapper.getRejection(request_no);
	}
	
	
	//인사발령 리스트 조회
	public List<Map<String, Object>> assignList (String startDate, String endDate, String search){
		log.info("필터로 조회: "+startDate+", "+endDate+", "+search);
		Map<String, Object> params = new HashMap<>();
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("search", search);
		
		List<Map<String, Object>> assignList = asMapper.assignList(params);
		return assignList;
		
	}
	
	//발령요청 중에 발령등록 막기
	public int assignStatusCount(String assignEmpId, String assignType) {
        // Map 생성하여 매퍼에 전달
        Map<String, Object> params = new HashMap<>();
        params.put("assign_emp_id", assignEmpId.trim()); // 공백 제거
        params.put("assign_type", assignType.trim());   // 공백 제거

        // 매퍼 호출
        return asMapper.assignStatusCount(params);
    }
		
	
	//요청내역 중간승인권자, 최종승인권자 사번 조회
	public Map<String, Object> getEmployees(Integer request_no) {
		 Map<String, Object> result = asMapper.getEmployees(request_no);
		    return result;
    }








}
	
	

