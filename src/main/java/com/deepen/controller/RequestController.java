package com.deepen.controller;


import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.AbsenceDTO;
import com.deepen.entity.Employees;
import com.deepen.service.AbsenceService;
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
	
	@Autowired
	private AbsenceService absenceService;
	
	
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
		
		return "request/request_assign_detail";
		
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

	// 요청상세내용 페이지 -휴직
	@GetMapping("/request-absence-detail")
	public String requestAbsenceDetail(@RequestParam("request_no") int request_no, @AuthenticationPrincipal User user, Model model) {
		//http://localhost:8082/request-absence-detail
		String emp_id = user.getUsername();
		
		log.info("request_no = " + request_no);
		
		// 사용자 정보 조회
		Optional<Employees> emp = absenceService.findById(emp_id);
		model.addAttribute("emp", emp.get());
		
		Map<String, Object> absence = rqService.getAbsenceWithRequest(request_no);
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		Timestamp timestamp = (Timestamp) absence.get("ABSENCE_START");
        if (timestamp != null) {
            LocalDateTime dateTime = timestamp.toLocalDateTime();
            String formattedDate = dateTime.format(formatter);
            absence.put("ABSENCE_START", formattedDate);
        }
        Timestamp timestamp2 = (Timestamp) absence.get("ABSENCE_END");
        if (timestamp2 != null) {
        	LocalDateTime dateTime = timestamp2.toLocalDateTime();
        	String formattedDate = dateTime.format(formatter);
        	absence.put("ABSENCE_END", formattedDate);
        }
        
        Object requestDate = absence.get("REQUEST_DATE");
        if (requestDate instanceof oracle.sql.TIMESTAMP) {
            try {
                // oracle.sql.TIMESTAMP -> java.sql.Timestamp
                Timestamp timestamp3 = ((oracle.sql.TIMESTAMP) requestDate).timestampValue();

                // java.sql.Timestamp -> java.util.Date (포맷팅용)
                Date date = new Date(timestamp3.getTime());

                // 날짜 포맷 설정 (2019-11-19 09:00)
                SimpleDateFormat formatter4 = new SimpleDateFormat("yyyy-MM-dd hh:mm");
                String formattedDate = formatter4.format(date);

                // 변환된 포맷된 날짜를 map에 저장
                absence.put("REQUEST_DATE", formattedDate);
            } catch (SQLException e) {
                log.info("Error converting REQUEST_DATE : " + e);
                absence.put("REQUEST_DATE", null);
            }
        }
        
        
        if(!absence.containsKey("HIGH_APPROVAL")) {
        	absence.put("HIGH_APPROVAL", "");
        }
        
        if(!absence.containsKey("MIDDLE_APPROVAL")) {
        	absence.put("MIDDLE_APPROVAL", "");
        }
        
        if(!absence.containsKey("")) {
        	absence.put("ABSENCE_REMARK", "");
        }
        
		
        log.info("requestAbsenceDetail - absence : " + absence.toString());
        
		model.addAttribute("absence", absence);
		model.addAttribute("request_no", request_no);
		
		
		return "request/request_absence_detail";
	}

	
	
	
	
}
