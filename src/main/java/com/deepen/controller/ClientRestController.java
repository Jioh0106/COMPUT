package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.entity.Client;
import com.deepen.entity.Material;
import com.deepen.service.ClientService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/client")
@Log
public class ClientRestController {
	
	/** 거래처 서비스 */
	private final ClientService service;
	
	
	/** 거래처 그리드 정보 저장 **/
	@PostMapping("/save")
    public ResponseEntity<List<Client>> saveMaterial(@RequestBody Map<String, List<Client>> modifiedRows) {
		log.info("modifiedRows : " + modifiedRows.toString());
		
		List<Client> updatedRows = modifiedRows.get("updatedRows");
		List<Client> createdRows = modifiedRows.get("createdRows");
		
		// 추가 처리
		if (createdRows != null && !createdRows.isEmpty()) {
			service.insertClient(createdRows);
		}
		
        // 업데이트 처리
        if (updatedRows != null && !updatedRows.isEmpty()) {
        	service.updateClient(updatedRows);
        }
        
        
        // 최신 데이터 반환
        List<Client> clientList = service.clientList();
        
	    
        return ResponseEntity.ok(clientList);
    }
	 
	/** 거래처 그리드 정보 삭제 **/
	@PostMapping("/delete")
	public ResponseEntity<String> deleteMaterial(@RequestBody List<Integer> deleteList) {
		
		log.info(deleteList.toString());
		
	    try {
	    	service.deleteClient(deleteList);
	        return ResponseEntity.ok("삭제가 완료되었습니다.");
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
	    }
	} // deleteMaterial
	
	
	
	
} // ClientRestController