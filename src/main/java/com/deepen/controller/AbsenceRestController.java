package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
        
        log.info("AttendanceRestController / getCommonList : " + commonList.toString());
        
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
    public ResponseEntity<List<Map<String, Object>>> updateAbsences(@RequestBody Map<String, List<Map<String, Object>>> modifiedRows, @AuthenticationPrincipal UserDetails userDetails) {
        List<Map<String, Object>> updatedRows = modifiedRows.get("updatedRows");
        List<Map<String, Object>> createdRows = modifiedRows.get("createdRows");
        
        // 업데이트 처리
        if (updatedRows != null && !updatedRows.isEmpty()) {
            absenceService.updateAbsences(updatedRows);
        }

        // 삽입 추가 처리
        if (createdRows != null && !createdRows.isEmpty()) {
            absenceService.insertAbsences(createdRows);
        }

        // 최신 데이터 반환
        List<Map<String, Object>> absenceList = absenceService.getAbsenceList();
        return ResponseEntity.ok(absenceList);
    }
	 
	
	
}