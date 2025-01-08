package com.deepen.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.service.AttendanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@Log
public class AttendanceRestController {
	
	private final AttendanceService attendanceService;
	
	
	// 공통코드별 공통코드상세 리스트 가져오기
	@GetMapping("/common/list/{type}")
    public ResponseEntity<List<CommonDetailDTO>> getCommonList(@PathVariable("type")  String type) {
		log.info("type : " + type);
		
        // 데이터를 서비스나 데이터베이스에서 가져오기
        List<CommonDetailDTO> commonList = attendanceService.getCommonList(type);
        
        log.info("AttendanceRestController / getCommonList : " + commonList.toString());
        
        return ResponseEntity.ok(commonList);
        
    } // getCommonList
	
	
	
	@GetMapping("/absence/request/{role}")
	public ResponseEntity<List<EmployeesDTO>> getAbsenceRequest(@PathVariable("role")  String role) {
		
		log.info("role : " + role);
		
		if(role.equals("MIDDLE")) {
			List<EmployeesDTO> middleList = attendanceService.getEmpList("ATHR002");
			
			return ResponseEntity.ok(middleList);
			
		} else {
			List<EmployeesDTO> highList = attendanceService.getEmpList("ATHR001");
			
			return ResponseEntity.ok(highList);
		}
		
		
		
		
		
	} // getAbsenceRequest
	
	
}
