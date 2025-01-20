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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
    public ResponseEntity<?> saveAssignmentAndRequest(@RequestBody Map<String, Object> requestData,
    		@AuthenticationPrincipal User user, RedirectAttributes redirect) {
        try {
        	log.info(requestData.toString());
        	
        	String emp_id = user.getUsername(); //시큐리티 로그인한 사원번호
        	log.info("로그인한 사원번호!!!!!!!!!"+emp_id);
        	
        	
        	// **권한 가져오기 (ROLE_ 접두어 제거)**
            Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
            String role = authorities.stream()
                                     .map(GrantedAuthority::getAuthority)
                                     .map(auth -> auth.replace("ROLE_", "")) // ROLE_ 접두어 제거
                                     .findFirst()
                                     .orElse("ATHR003"); // 권한이 없을 경우 기본값 설정

            log.info("로그인한 사원의 권한: " + role);
        	
        	
        	
        	// JSON 데이터를 각각의 DTO로 변환
            ObjectMapper mapper = new ObjectMapper();
            RequestDTO requestDto = mapper.convertValue(requestData.get("requestDto"), RequestDTO.class);
            AssignmentDTO assignmentDto = mapper.convertValue(requestData.get("assignmentDto"), AssignmentDTO.class);
            
           log.info(requestDto.toString());
           log.info(assignmentDto.toString());
            
           // 요청진행중인 사원번호는 발령 등록 못 하도록
           String assignEmpId = assignmentDto.getAssign_emp_id().trim();
           String assignType = assignmentDto.getAssign_type().trim();
           log.info("뭐냐고진짜"+ assignEmpId);
           log.info("뭐냐고진짜"+ assignType);

           if (assignEmpId == null || assignType == null) {
               return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("필수 파라미터가 누락되었습니다.");
           }

           int count = asService.assignStatusCount(assignEmpId, assignType);
         System.out.println("@@@@@카운트값"+count);
           if (count > 0) {
               return ResponseEntity.status(HttpStatus.CONFLICT).body("결재 진행 중인 발령 요청이 존재합니다.");
           }

           //발령등록처리(서비스호출 및 요청번호 반환)
           Integer request_no = asService.saveAssigmentAndRequest(requestDto, assignmentDto, emp_id, role);
           
            
           //반환된 요청번호를 통해 요청 구분 정보 조회
          RequestDTO resultRequestDto = asService.getRequestDivision(emp_id, request_no);

            log.info("요청 구분: " + resultRequestDto.getRequest_division());
            
            return ResponseEntity.ok(resultRequestDto);
        	
        }catch (Exception e) {
        	log.info("무슨오류냐고"  +e.toString());
        	e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            
        }
    }
	
	
	
	//인사발령현황 페이지
	@GetMapping("/assign-stts")
	public String assignStts() {
		//http://localhost:8082/assign-stts
		
		return "personnel/assign_stts";
	}

}
