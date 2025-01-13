package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.service.AssignService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@Log
public class AssignRestController {

	private final AssignService asService;
	
	
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
		log.info("@@해당요청번호로 발령조회"+requestAssign.toString());
		log.info("@@요청구분!!발신수신@@"+ requestDto.getRequest_division());
		
		Map<String, Object> response = new HashMap<>();
		response.put("assignment",requestAssign);
		response.put("request", requestDto);
		
		return response;
	}
	
	
	
	
	
}
