package com.deepen.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.service.AssignService;
import com.deepen.service.RequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@Log
public class AssignRestController {

	private final AssignService asService;
	private final RequestService rqService;
	
	
	//발령등록페이지 공통코드 연결
	@GetMapping("/assignCommonDetail")
	public List<CommonDetailDTO> fetchAssignCommonDetail(){
		
		List<CommonDetailDTO> codeList = asService.fetchAssignCommonDetail();
		log.info(codeList.toString());
		
		return codeList;
	}
	
	//발령등록페이지 직원검색
	@GetMapping("/empSearch")
	public List<EmployeesDTO> empSearch(@RequestParam ("keyword")String keyword){
		List<EmployeesDTO> search = asService.empSearch(keyword);
//		log.info("키워드"+keyword);
//		log.info("검색결과"+search.toString());
		
		return search;
	}
	
	//중간승인권자 조회 모달창
	@GetMapping("/middleRole")
	public List<EmployeesDTO> middleRole(){
		List<EmployeesDTO> search = asService.middleRoleSearch();
		return search;
	}
	
	
	//최종승인권자 조회 모달창
	@GetMapping("/highRole")
	public List<EmployeesDTO> highRole(){
		List<EmployeesDTO> search = asService.highRoleSearch();
		return search;
	}
	
	//요청번호로 발령테이블 조회
	@GetMapping("/selectAssign/{request_no}") 
	public Map<String, Object> selectAssign(@PathVariable("request_no") Integer request_no, 
			@AuthenticationPrincipal User user){
		String emp_id = user.getUsername(); //로그인한 사원번호
		
		RequestDTO requestDto = asService.getRequestDivision(emp_id, request_no);
		AssignmentDTO requestAssign = asService.selectAssign(request_no);
		 Map<String, Object> requestStatus = rqService.getRequest(request_no); // 요청 상태 가져오기
		log.info("@@해당요청번호로 발령조회"+requestAssign.toString());
		log.info("@@요청구분!!발신or수신@@ "+ requestDto.getRequest_division());
		log.info("요청상태 "+ requestStatus.get("REQUEST_STATUS"));
		
		Map<String, Object> response = new HashMap<>();
		response.put("assignment",requestAssign);
		response.put("request", requestDto);
		response.put("request_status", requestStatus.get("REQUEST_STATUS")); //상태추가
		
		return response;
	}
	
	
	//반려사유 업데이트 및 상태변경
    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> updateRequestStatusAndReason(@RequestParam("request_no") Integer request_no,
                                                                            @RequestParam("request_rejection") String request_rejection) {
        boolean isUpdated = asService.updateRejection(request_no, request_rejection);
        
        if (isUpdated) {
            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } else {
            return ResponseEntity.status(500).body(Collections.singletonMap("success", false));
        }
    }

    // 반려사유 조회
    @GetMapping("/reject/reason")
    public ResponseEntity<RequestDTO> getRejectReason(@RequestParam("request_no") Integer request_no) {
        RequestDTO rejectReason = asService.getRejection(request_no);
        if (rejectReason != null) {
            return ResponseEntity.ok(rejectReason);
        } else {
            return ResponseEntity.status(404).build();
            
        }
    }
	
	
    //인사발령현황 리스트 조회
    @GetMapping("/assign/list")
    public List<Map<String, Object>> assignList (@RequestParam(value="startDate") String startDate,
    		@RequestParam(value="endDate") String endDate, 
    		@RequestParam(value = "search",defaultValue = "") String search){
    	List<Map<String,Object>> assignList = asService.assignList(startDate, endDate, search);
    	
    	return assignList;
    }
	
    
    //요청내역 중간승인권자 최종승인권자 사번 조회
    @GetMapping("/getEmployees")
    public ResponseEntity<Map<String, Object>> getEmployees(@RequestParam("request_no") Integer request_no) {
        Map<String, Object> employees = asService.getEmployees(request_no);
        return ResponseEntity.ok(employees); // JSON 형태로 반환
    }
    
	
}
