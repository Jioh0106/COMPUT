package com.deepen.controller;


import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.RequestDTO;
import com.deepen.entity.Employees;
import com.deepen.service.AssignService;
import com.deepen.service.RequestService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;

@Log
@Controller
public class RequestController {
	
	@Autowired
	private RequestService rqService;
	@Autowired
	private AssignService asService;
	
	
	//요청내역 리스트 페이지
	@GetMapping("/request-list")
	public String requestList(@AuthenticationPrincipal User user,HttpServletRequest request, Model model) {
		//http://localhost:8082/request-list
		
		String emp_id = user.getUsername();
		Optional<Employees> emp = asService.findById(emp_id);
		model.addAttribute("emp",emp.get());
		
	
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
	    model.addAttribute("_csrf", csrfToken);
		
		return"request/request_list"; //요청내역 보여주는 페이지
	}
	
	
	//요청상세내용 페이지(팝업창)
	@GetMapping("/request-assign-detail")
	public String requestAssignDetail() {
		//http://localhost:8082/request-assign-detail
		
		return"request/request_assign_detail";
	}
	
	
	//중간승인권자가 최종승인권자 선택 시 request 테이블 업데이트
	@ResponseBody
	@PostMapping("/request-update")
	public ResponseEntity<String> updateHighApproval(@RequestBody Map<String, Object> requestData,
	                                                 @AuthenticationPrincipal User user) {
	    try {
	        String emp_id = user.getUsername(); // 로그인한 사원번호
	        log.info("요청 데이터: " + requestData);
	        
	        
	    	// **권한 가져오기 (ROLE_ 접두어 제거)**
            Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
            String role = authorities.stream()
                                     .map(GrantedAuthority::getAuthority)
                                     .map(auth -> auth.replace("ROLE_", "")) // ROLE_ 접두어 제거
                                     .findFirst()
                                     .orElse("ATHR003"); // 권한이 없을 경우 기본값 설정

            log.info("로그인한 사원의 권한: " + role);
	        
	        // JSON 데이터를 RequestDTO로 변환
	        ObjectMapper mapper = new ObjectMapper();
	        RequestDTO requestDto = mapper.convertValue(requestData.get("requestDto"), RequestDTO.class);

	        // 요청번호가 반드시 존재해야 하므로 체크
	        if (requestDto.getRequest_no() == null) {
	            throw new IllegalArgumentException("요청번호가 필요합니다.");
	        }
	        log.info("전달된 요청번호@@: " + requestDto.getRequest_no());
	        
	        // 서비스 호출: 최종 승인자 정보 업데이트
	        rqService.updateApproval(requestDto, emp_id, role);

	        return ResponseEntity.ok("최종 승인자 정보가 업데이트되었습니다.");
	    } catch (Exception e) {
	        log.info("업데이트 처리 중 오류 발생: " + e.toString());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업데이트 처리 중 오류가 발생했습니다.");
	    }
	}

	
	
	
}
