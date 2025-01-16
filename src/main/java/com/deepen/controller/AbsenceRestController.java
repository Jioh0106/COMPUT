package com.deepen.controller;

import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.service.AbsenceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/absence")
@Log
public class AbsenceRestController {
	
	private final AbsenceService absenceService;
	
	
	// 공통코드별 공통코드상세 리스트 가져오기
	@GetMapping("/common/list/{type}")
    public ResponseEntity<List<CommonDetailDTO>> getCommonList(@PathVariable("type")  String type) {
		log.info("type : " + type);
		
        // 데이터를 서비스나 데이터베이스에서 가져오기
        List<CommonDetailDTO> commonList = absenceService.getCommonList(type);
        
        log.info("AbsenceRestController / getCommonList : " + commonList.toString());
        
        return ResponseEntity.ok(commonList);
        
    } // getCommonList
	
	
	
	@GetMapping("/request/{role}")
	public ResponseEntity<List<Map<String, String>>> getAbsenceRequest(@PathVariable("role")  String role) {
		
		log.info("role : " + role);
		
		List<Map<String, String>> list = absenceService.getEmpList(role);
		return ResponseEntity.ok(list);
		
		
	} // getAbsenceRequest
	
	@GetMapping("/self/{emp_id}")
	public ResponseEntity<Map<String, String>> getAbsenceRequestself(@PathVariable("emp_id")  String emp_id) {
		
		log.info("getAbsenceRequestself - emp_id : " + emp_id);
		
		Map<String, String> emp_self = absenceService.getEmpSelf(emp_id);
		return ResponseEntity.ok(emp_self);
		
		
	} // getAbsenceRequest
	
	@GetMapping("/serch/{emp_name}")
	public ResponseEntity<List<Map<String, String>>> getEmpSerch(@PathVariable("emp_name")  String emp_name) {
		
		log.info("emp_name : " + emp_name);
		
		List<Map<String, String>> list = absenceService.getEmpSerch(emp_name);
		
		if (list == null || list.isEmpty()) {
	        log.info("No results found for emp_name: " + emp_name);
	        return ResponseEntity.ok(Collections.emptyList()); // 빈 배열 반환
	    }
		
		log.info("getEmpSerch : " + list.toString());
		
		return ResponseEntity.ok(list);
		
		
	} // getAbsenceRequest
	
	
	
	
	@PostMapping("/delete")
	public ResponseEntity<String> deleteAbsences(@RequestBody List<Integer> deleteList) {
		log.info(deleteList.toString());
		
	    try {
	        absenceService.deleteAbsences(deleteList);
	        return ResponseEntity.ok("삭제가 완료되었습니다.");
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
	    }
	}
	
	
	@PostMapping("/update")
    public ResponseEntity<List<Map<String, Object>>> updateAbsences(@RequestBody Map<String, List<Map<String, Object>>> modifiedRows, @AuthenticationPrincipal User user) {
		
		String emp_id = user.getUsername();
		Collection<GrantedAuthority> authorities = user.getAuthorities();
		String emp_role = authorities.iterator().next().getAuthority().replace("ROLE_", "");
		
        List<Map<String, Object>> updatedRows = modifiedRows.get("updatedRows");
        List<Map<String, Object>> createdRows = modifiedRows.get("createdRows");
        
        // 업데이트 처리
        if (updatedRows != null && !updatedRows.isEmpty()) {
            absenceService.updateAbsences(updatedRows, emp_id);
        }

        // 삽입 추가 처리
        if (createdRows != null && !createdRows.isEmpty()) {
            absenceService.insertAbsences(createdRows, emp_role, emp_id);
        }

        // 최신 데이터 반환
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
	    
        return ResponseEntity.ok(absenceList);
    }
	 
	
	
}