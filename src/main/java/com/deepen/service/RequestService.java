package com.deepen.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.RequestDTO;
import com.deepen.entity.Assignment;
import com.deepen.entity.Employees;
import com.deepen.entity.Request;
import com.deepen.repository.AssignmentRepository;
import com.deepen.repository.PersonnelRepository;
import com.deepen.mapper.RequestMapper;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@Log
@RequiredArgsConstructor // 객체생성
public class RequestService {
	
	private final RequestRepository rqRepository;
	private final AssignmentRepository asRepository;
	private final PersonnelRepository psRepository;
	private final RequestMapper rqMapper;
	
	//로그인한 요청내역 조회
	public List<RequestDTO> requestAllList(String emp_id){
		
		List<Request> requests = rqRepository.findByEmp_id(emp_id);
		
		  // Request -> RequestDTO 변환 및 요청 구분 설정
        List<RequestDTO> requestDtos = new ArrayList<>();
        for (Request request : requests) {
            RequestDTO requestDto = new RequestDTO();
            requestDto.setRequest_no(request.getRequest_no());
            requestDto.setEmp_id(request.getEmp_id());
            requestDto.setRequest_type(request.getRequest_type());
            requestDto.setRequest_date(request.getRequest_date());
            requestDto.setRequest_deadline(request.getRequest_deadline());
            requestDto.setMiddle_approval(request.getMiddle_approval());
            requestDto.setHigh_approval(request.getHigh_approval());
            requestDto.setRequest_status(request.getRequest_status());
            requestDto.setRequest_rejection(request.getRequest_rejection());
            
            // **요청자의 사번으로 Employees 테이블에서 이름과 부서명 조회**
            Optional<Employees> employees = psRepository.findById(request.getEmp_id());
            if (employees.isPresent()) {
                Employees employee = employees.get();
                requestDto.setEmp_name(employee.getEmp_name());   // 요청자 이름 설정
                requestDto.setEmp_dept(employee.getEmp_dept());   // 요청자 부서명 설정
            } else {
                log.info("사원 정보를 찾을 수 없습니다. 요청자 사번: " + request.getEmp_id());
            }
            

            // 중간 승인자 및 최종 승인자 사번 추출
            String middleApprovalEmpId = request.getMiddle_approval();
            String finalApprovalEmpId = (request.getHigh_approval() != null) ? request.getHigh_approval() : null;

            // 요청 상태 추출
            String requestStatus = request.getRequest_status();

            // 요청 구분 설정 (발신/수신)
            if (emp_id.equals(finalApprovalEmpId) && ("RQST003".equals(requestStatus) || "RQST005".equals(requestStatus))) {
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

            requestDtos.add(requestDto);
        }

        return requestDtos;
            
    }
	
	// 요청 상세 - 휴직 
	public Map<String, Object> getAbsenceWithRequest(int request_no) {
		
		Map<String, Object> map = rqMapper.getAbsenceWithRequest(request_no);
		log.info("RequestService -  absence" + map.toString());
		
		return map;
	}
	
	// 요청 테이블 업데이트
	public void updateAbsenceRequest(Map<String, Object> updateData) {
		
		rqMapper.updateStatus(updateData);
	}

		
	//중간승인권자, 최종승인권자 로그인 시 -> 요청내역에서 팝업창에서 승인 업데이트 처리
	public void updateApproval(RequestDTO requestDto, String  emp_id, String role) {
		 // 요청번호로 기존 요청 조회
	    Request request = rqRepository.findById(requestDto.getRequest_no())
	                                  .orElseThrow(() -> new RuntimeException("요청을 찾을 수 없습니다."));
	   log.info("전달된 요청번호: " + requestDto.getRequest_no());
	   log.info("권한권한뭐냐고오ㅗ"+role);
	   
	    if("ATHR001".equals(role)) {
	    	request.setRequest_status("RQST005"); // 최종 승인 완료 상태로 업데이트
	    	Assignment assignment = asRepository.findByRequest_no(requestDto.getRequest_no())
	    										.orElseThrow(()->new RuntimeException("요청을 찾을 수 없음"));
	    	assignment.setRegistr_date(LocalDateTime.now()); //발령테이블 - 최종승인일자
	    	asRepository.save(assignment);
	    	log.info("해당요청번호 발령테이블!!!!!!"+assignment.toString());
	    	
	    }else if("ATHR002".equals(role)) {
	    	// 최종 승인자 정보 업데이트
	    	request.setRequest_status("RQST003"); // 중간 승인 완료 상태로 업데이트
	    	request.setHigh_approval(requestDto.getHigh_approval());
	    	
	    }else {
	    	throw new RuntimeException("승인 권한이 없습니다.");
	    }
	    
	    // 요청 저장 (업데이트)
	    rqRepository.save(request);
	    log.info("최종 승인자 정보가 업데이트되었습니다. 요청번호: " + request.getRequest_no());
	    
	    
	}





}
	
	
	 
	
	
	

