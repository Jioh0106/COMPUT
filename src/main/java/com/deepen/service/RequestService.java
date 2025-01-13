package com.deepen.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

            requestDtos.add(requestDto);
        }

        return requestDtos;
            
    }

		
	//중간승인권자 로그인 시 -> 요청내역에서 최종승인권자 선택 후 업데이트 처리
	public void updateApproval(RequestDTO requestDto, String  emp_id) {
		 // 요청번호로 기존 요청 조회
	    Request request = rqRepository.findById(requestDto.getRequest_no())
	                                  .orElseThrow(() -> new RuntimeException("요청을 찾을 수 없습니다."));
	    // 최종 승인자 정보 업데이트
	    request.setHigh_approval(requestDto.getHigh_approval());
	    request.setRequest_status("RQST003"); // 중간 승인 완료 상태로 업데이트
	    

	    // 요청 저장 (업데이트)
	    rqRepository.save(request);
	    log.info("최종 승인자 정보가 업데이트되었습니다. 요청번호: " + request.getRequest_no());
	    
	    
	}





}
	
	
	 
	
	
	

