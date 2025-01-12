package com.deepen.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.RequestDTO;
import com.deepen.entity.Request;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@Log
@RequiredArgsConstructor // 객체생성
public class RequestService {
	
	private final RequestRepository rqRepository;
	
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
//            requestDto.setEmp_name(request.getEmp_name());
//            requestDto.setEmp_dept(request.getEmp_dept());
            requestDto.setRequest_date(request.getRequest_date());
            requestDto.setRequest_deadline(request.getRequest_deadline());
            requestDto.setMiddle_approval(request.getMiddle_approval());
            requestDto.setHigh_approval(request.getHigh_approval());
            requestDto.setRequest_status(request.getRequest_status());
            requestDto.setRequest_rejection(request.getRequest_rejection());
//           
//            // 중간 승인자 및 최종 승인자 사원번호
//            String middleApprovalEmpId = (request.getMiddle_approval());
//            String finalApprovalEmpId = (request.getHigh_approval() != null) ? (request.getHigh_approval()) : null;
//            
//            // 요청 구분 설정 (발신/수신)
//            if (emp_id.equals(request.getEmp_id())) {
//                requestDto.setRequest_division("발신");
//            } 
//            if (emp_id.equals(middleApprovalEmpId) || emp_id.equals(finalApprovalEmpId)) {
//                requestDto.setRequest_division("수신");
//            }
//
//            requestDtos.add(requestDto);
//        }
//
//        return requestDtos;
            // 중간 승인자 및 최종 승인자 사번 추출
            String middleApprovalEmpId = request.getMiddle_approval();
            String finalApprovalEmpId = (request.getHigh_approval() != null) ? request.getHigh_approval() : null;

            // 요청 상태 추출
            String requestStatus = request.getRequest_status();

            // 요청 구분 설정 (발신/수신)
            if (emp_id.equals(request.getEmp_id())) {
                requestDto.setRequest_division("발신");
            } 
            // 중간 승인자가 수신자로 간주될 경우 (상태가 RQST003인 경우에만 수신)
            else if (emp_id.equals(middleApprovalEmpId) && "RQST003".equals(requestStatus)) {
                requestDto.setRequest_division("발신");
            } 
            // 최종 승인자가 수신자로 간주될 경우 (상태가 RQST005인 경우에만 수신)
            else if (emp_id.equals(finalApprovalEmpId) && "RQST003".equals(requestStatus)) {
                requestDto.setRequest_division("수신");
            } 
            // 그 외의 경우 발신으로 간주
            else {
                requestDto.setRequest_division("발신");
            }

            requestDtos.add(requestDto);
        }

        return requestDtos;
            
            
            
    }

		
		





}
	
	
	 
	
	
	

