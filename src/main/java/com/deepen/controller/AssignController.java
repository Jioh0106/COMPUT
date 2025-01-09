package com.deepen.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.domain.AssignmentDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.service.AssignService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.java.Log;

@Controller
@Log
public class AssignController {
	
	@Autowired
	private AssignService asService;
	
	//인사발령등록 페이지
	@GetMapping("/assign-insert")
	public String assignInsert() {
		//http://localhost:8082/assign-insert
		
		return "personnel/assign_insert";
		
	}
	
	
	//발령등록, 요청내역 데이터 저장
	@ResponseBody
	@PostMapping("/assign-insertPOST")
    public ResponseEntity<String> saveAssignmentAndRequest(@RequestBody Map<String, Object> requestData) {
        try {
        	log.info(requestData.toString());
        	
        	// JSON 데이터를 각각의 DTO로 변환
            ObjectMapper mapper = new ObjectMapper();
            RequestDTO requestDto = mapper.convertValue(requestData.get("requestDto"), RequestDTO.class);
            AssignmentDTO assignmentDto = mapper.convertValue(requestData.get("assignmentDto"), AssignmentDTO.class);
            
           log.info(requestDto.toString());
           log.info(assignmentDto.toString());
            asService.saveAssigmentAndRequest(requestDto, assignmentDto);
           
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
