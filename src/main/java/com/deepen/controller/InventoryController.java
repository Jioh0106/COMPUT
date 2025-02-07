package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class InventoryController {
	
	@GetMapping("/inventory-status")
	public String inventoryStatus() {
		// http://localhost:8082/inventory-status
		return"inventory/inventory_status";
	}
}
