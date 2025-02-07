package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.ScheduleDTO;
import com.deepen.domain.WorkAddDTO;
import com.deepen.domain.WorkDTO;
import com.deepen.service.WorkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@Log
@RequestMapping("/api/work")
public class WorkRestController {
	
	/** 근무관리 서비스 */
	private final WorkService workService;
	
	/** 직원 검색 조회 */
	@GetMapping("/serchEmp")
	public ResponseEntity<List<Map<String, String>>> getSerchEmpList(@RequestParam Map<String, String> serchEmpInfo) {
		
		log.info("serchEmpInfo : "+serchEmpInfo.toString());
		List<Map<String, String>> list = workService.getEmpSerch(serchEmpInfo);
		
		log.info("list : " + list.toString());
		
		
		return ResponseEntity.ok(list);
		
		
	} // getSerchEmpList

	
	// 선택된 직원이 선택된 날짜에 기등록된 근무 일정이 있는지 확인
	@PostMapping("/check")
	public ResponseEntity<?> checkWork(@RequestBody WorkAddDTO appendData) {
		
		log.info("checkWork - appendData : "+ appendData.toString());
		
		try {
	        List<WorkDTO> existWork = workService.ckeckWork(appendData);

	        if (existWork != null && !existWork.isEmpty()) {
	            log.info("existWork : " + existWork.toString());
	            return ResponseEntity.ok(existWork);
	        }

	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 기간에 등록된 직원이 없습니다.");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("작업 확인 중 오류가 발생했습니다.");
	    }
			
		
		
	} // ckeckWork
	
	// 근무 테이블에 추가
	@PostMapping("/insert")
    public ResponseEntity<String> insertWork(@RequestBody WorkAddDTO appendData) {
		
		log.info("insertWork -  appendData : "+ appendData.toString());
		
	    try {
	    	workService.insertWork(appendData);
	        return ResponseEntity.ok("일정 등록이 완료되었습니다.");
	        
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("추가 중 오류 발생");
	    }
			
	    
    } // insertWork
	
	/** 근무일정 정보 조회 */
	@GetMapping("/list")
	public ResponseEntity<List<WorkDTO>> getWorkList(@RequestParam("start") String start, 
													@RequestParam("end") String end,
													@AuthenticationPrincipal User user) {
		
		String emp_id = user.getUsername();
		
		Map<String, String> map = new HashMap<>();
		map.put("emp_id", emp_id);
		map.put("start", start);
		map.put("end", end);
		
		List<WorkDTO> list = workService.getWorkList(map);
		
		return ResponseEntity.ok(list);
        
	}
	
	@GetMapping("/list/serch")
	public ResponseEntity<List<WorkDTO>> getWorkListSerch(@RequestParam("start") String start, 
													@RequestParam("end") String end,
													@RequestParam("dept") String dept,
													@RequestParam("emp_info") String emp_info) {
		
		log.info("dept = " + dept );
		log.info("emp_info = " + emp_info );
		log.info("start = " + start );
		log.info("end = " + end );
		
		Map<String, String> map = new HashMap<>();
		map.put("start", start);
		map.put("end", end);
		map.put("dept", dept);
		map.put("emp_info", emp_info);
		
		List<WorkDTO> list = workService.getWorkListSerch(map);
		
		log.info("getWorkListSerch = " +list.toString());
		
		return ResponseEntity.ok(list);
        
	}
	
	
	@GetMapping("/schedules")
	public ResponseEntity<List<ScheduleDTO>> getSchedules( @RequestParam("startDate") String startDate,
	        											@RequestParam("endDate") String endDate,
	        											@AuthenticationPrincipal User user) {
		String emp_id = user.getUsername();
		log.info("startDate : " + startDate);
		log.info("endDate : " + endDate);
		log.info("emp_id : " + emp_id);
		
		Map<String, String> map = new HashMap<>();
		map.put("start", startDate);
		map.put("end", endDate);
		map.put("emp_id", emp_id);
		
		List<ScheduleDTO> schedules = workService.getSchedulesBetween(map);
		
		
		return ResponseEntity.ok(schedules);
	}
	
	
	
} // WorkRestController
