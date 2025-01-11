package com.deepen.controller;

import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.AbsenceDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.entity.Employees;
import com.deepen.service.AbsenceService;
import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class AbsenceController {
	
	private final AbsenceService absenceService;
	
	// 휴직 관리
	@GetMapping("/loab-mng")
	public String absence(Model model, @AuthenticationPrincipal User user, HttpServletRequest request) throws JsonProcessingException {
		//http://localhost:8082/loab-mng
		log.info("user.getUsername() : " + user.getUsername());
		String emp_id = user.getUsername();
		
		// 사용자 정보 조회
		Optional<Employees> emp = absenceService.findById(emp_id);
		
		
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
	    model.addAttribute("_csrf", csrfToken);
	    
		
		List<Map<String, Object>> absenceList = absenceService.getAbsenceList();
		
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    absenceList.forEach(item -> {
	        Timestamp timestamp = (Timestamp) item.get("ABSENCE_START");
	        if (timestamp != null) {
	            LocalDateTime dateTime = timestamp.toLocalDateTime();
	            String formattedDate = dateTime.format(formatter);
	            item.put("ABSENCE_START", formattedDate);
	        }
	        Timestamp timestamp2 = (Timestamp) item.get("ABSENCE_END");
	        if (timestamp2 != null) {
	        	LocalDateTime dateTime = timestamp2.toLocalDateTime();
	        	String formattedDate = dateTime.format(formatter);
	        	item.put("ABSENCE_END", formattedDate);
	        }
	    });
	    
	    absenceList.forEach(item -> {
	        Object requestDate = item.get("REQUEST_DATE");
	        if (requestDate instanceof oracle.sql.TIMESTAMP) {
	            try {
	                // oracle.sql.TIMESTAMP -> java.sql.Timestamp
	                Timestamp timestamp = ((oracle.sql.TIMESTAMP) requestDate).timestampValue();

	                // java.sql.Timestamp -> java.util.Date (포맷팅용)
	                Date date = new Date(timestamp.getTime());

	                // 날짜 포맷 설정 (2019-11-19 09:00)
	                SimpleDateFormat formatter1 = new SimpleDateFormat("yyyy-MM-dd hh:mm");
	                String formattedDate = formatter1.format(date);

	                // 변환된 포맷된 날짜를 map에 저장
	                item.put("REQUEST_DATE", formattedDate);
	            } catch (SQLException e) {
	                log.info("Error converting REQUEST_DATE : " + e);
	                item.put("REQUEST_DATE", null);
	            }
	        }
	    });

	    
		log.info("absenceList : " + absenceList.toString());
		
		model.addAttribute("emp", emp.get());
		model.addAttribute("absenceList", absenceList);
		
		return "attendance/loab_mng";
	}
	
	
	@PostMapping("/loab-insert")
	public String loabInsert(Model model, RequestDTO requestDTO, AbsenceDTO absenceDTO,
							@RequestParam("request_role") String request_role,
							@RequestParam("request_approval") String request_approval
//							@RequestParam("request_deadline") int deadline
						   ) {
	
		log.info("loabInsert - request_role : " + request_role);
		log.info("loabInsert - request_approval : " + request_approval);
		
		requestDTO.setRequest_type("휴직");
//		requestDTO.setRequest_date(new Timestamp(System.currentTimeMillis()));
		
		
		// 승인요청 수신자가 high 권한이면 1차 승인자에 본인 아이디, 요청 상태는 2차대기		
		if(request_role.equals("ATHR001")) {
			requestDTO.setMiddle_approval(requestDTO.getEmp_id());
			requestDTO.setHigh_approval(request_approval);
			requestDTO.setRequest_status("RQST005");
		} else {
			// 아니라면 (middle이라면) 1차 승인자에 요청 수신자, 요청 상태는 1차 대기
			requestDTO.setMiddle_approval(request_approval);
			requestDTO.setRequest_status("RQST006");
		}
		
		absenceService.insertAbsenceAndRequest(requestDTO, absenceDTO);
		
		
		return "redirect:/loab-mng";
		
		
	}
	
	
	
	

}