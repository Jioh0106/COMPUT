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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.entity.Employees;
import com.deepen.service.AssignService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;

@Controller
@Log
public class AssignController {
	
	@Autowired
	private AssignService asService;
	
	//인사발령등록 페이지
	@GetMapping("/assign-insert")
	public String assignInsert(@AuthenticationPrincipal User user, HttpServletRequest request, Model model) {
		//http://localhost:8082/assign-insert
		
		String emp_id = user.getUsername(); //시큐리티 로그인한 사원번호
		Optional<Employees> emp = asService.findById(emp_id);
		model.addAttribute("emp", emp.get());
		
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
	    model.addAttribute("_csrf", csrfToken);
		
		
		return "personnel/assign_insert";
		
	}
	
	
	//발령등록, 요청내역 데이터 저장
	@ResponseBody
	@PostMapping("/assign-insertPOST")
    public ResponseEntity<String> saveAssignmentAndRequest(@RequestBody Map<String, Object> requestData,
    		@AuthenticationPrincipal User user, @AuthenticationPrincipal UserDetails userDetails) {
        try {
        	log.info(requestData.toString());
        	
        	String emp_id = user.getUsername(); //시큐리티 로그인한 사원번호
        	log.info("로그인한 사원번호!!!!!!!!!"+emp_id);
        	
        	Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        	  // 로그인한 사용자의 권한 가져오기
            String role = authorities.stream()
                                     .map(GrantedAuthority::getAuthority) // 권한 이름 문자열로 변환
                                     .findFirst() // 첫 번째 권한만 가져옴
                                     .orElse("UNKNOWN"); // 권한이 없을 경우 기본값

            log.info("로그인한 사원의 권한: " + role);
        	
        	// JSON 데이터를 각각의 DTO로 변환
            ObjectMapper mapper = new ObjectMapper();
            RequestDTO requestDto = mapper.convertValue(requestData.get("requestDto"), RequestDTO.class);
            AssignmentDTO assignmentDto = mapper.convertValue(requestData.get("assignmentDto"), AssignmentDTO.class);
            
           log.info(requestDto.toString());
           log.info(assignmentDto.toString());
            asService.saveAssigmentAndRequest(requestDto, assignmentDto, emp_id);
           
            return ResponseEntity.ok("발령 등록 및 요청 내역 저장이 완료되었습니다. ");
        } catch (Exception e) {
        	log.info("무슨오류냐고"+e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("발령 등록 및 요청 내역 저장에 실패했습니다.");
        }
    }
	
	
	
	//인사발령현황 페이지
	@GetMapping("/assign-stts")
	public String assignStts() {
		//http://localhost:8082/assign-stts
		
		return "personnel/assign_stts";
	}

}
