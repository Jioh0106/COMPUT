package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.InvHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class InventoryController {
	
	//실재고량 변경이력 서비스
	private final InvHistoryService invhService;
	
	
	
	@GetMapping("/inventory-status")
	public String inventoryStatus(@AuthenticationPrincipal User user, Model model) {
		// http://localhost:8082/inventory-status
		
		String emp_id = user.getUsername();
		log.info("로그인한 사번 : "+ emp_id);
		model.addAttribute("emp_id", emp_id);
		
		//변경사유 공통코드
		List<Map<String, Object>> reasonChangeList = invhService.reasonChangeList();
		log.info("변경사유 리스트 :"+ reasonChangeList);
		model.addAttribute("reasonChangeList", reasonChangeList);
		
		
		return"inventory/inventory_status";
	}
}
