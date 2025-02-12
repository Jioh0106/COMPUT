package com.deepen.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class InventoryController {
	
	@GetMapping("/inventory-status")
	public String inventoryStatus(@AuthenticationPrincipal User user, Model model) {
		// http://localhost:8082/inventory-status
		
		String emp_id = user.getUsername();
		log.info("로그인한 사번 : "+ emp_id);
		
		model.addAttribute("emp_id", emp_id);
		
		
		return"inventory/inventory_status";
	}
}
