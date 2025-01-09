package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
	
	private final AbsenceService attendanceService;
	
	
	// 공통코드별 공통코드상세 리스트 가져오기
	@GetMapping("/common/list/{type}")
    public ResponseEntity<List<CommonDetailDTO>> getCommonList(@PathVariable("type")  String type) {
		log.info("type : " + type);
		
        // 데이터를 서비스나 데이터베이스에서 가져오기
        List<CommonDetailDTO> commonList = attendanceService.getCommonList(type);
        
        log.info("AttendanceRestController / getCommonList : " + commonList.toString());
        
        return ResponseEntity.ok(commonList);
        
    } // getCommonList
	
	
	
	@GetMapping("/request/{role}")
	public ResponseEntity<List<Map<String, String>>> getAbsenceRequest(@PathVariable("role")  String role) {
		
		log.info("role : " + role);
		
		// 요청된 role이 HIGH면 HIGH 권한자 리스트 반환
		if(role.equals("HIGH")) {
			List<Map<String, String>> highList = attendanceService.getEmpList("ATHR001");
			return ResponseEntity.ok(highList);
		} 
		
		// 요청된 role middle이면 middle 권한자 리스트 반환
		List<Map<String, String>> middleList = attendanceService.getEmpList("ATHR002");
		return ResponseEntity.ok(middleList);
		
		
		
		
		
	} // getAbsenceRequest
	
	
}
