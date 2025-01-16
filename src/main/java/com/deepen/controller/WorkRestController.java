package com.deepen.controller;

import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.WorkAddDTO;
import com.deepen.domain.WorkDTO;
import com.deepen.domain.WorkTmpDTO;
import com.deepen.entity.WorkTmp;
import com.deepen.service.WorkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@Log
@RequestMapping("/api/work")
public class WorkRestController {
	
	private final WorkService workService;
	
	@GetMapping("/serchEmp")
	public ResponseEntity<List<Map<String, String>>> getSerchEmpList(@RequestParam Map<String, String> serchEmpInfo) {
		
		log.info("serchEmpInfo : "+serchEmpInfo.toString());
		List<Map<String, String>> list = workService.getEmpSerch(serchEmpInfo);
		
		log.info("list : " + list.toString());
		
		
		return ResponseEntity.ok(list);
		
		
	} // getSerchEmpList

	@PostMapping("/insert")
    public ResponseEntity<String> insertWork(@RequestBody WorkAddDTO appendData) {
		
		log.info("appendData : "+ appendData.toString());
		
	    try {
	    	
	    	
	    	if(workService.ckeckWork(appendData)) {
	    		
	    		return ResponseEntity.ok("해당 기간에 이미 등록된 직원이 있습니다.");
	    	}
	    	
	    	workService.insertWork(appendData);
	        return ResponseEntity.ok("추가가 완료되었습니다.");
	        
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("추가 중 오류 발생");
	    }
			
	    
    }
	
	
	
	
} // WorkRestController
