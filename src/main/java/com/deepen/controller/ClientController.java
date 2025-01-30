package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.ClientService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class ClientController {
	
	private final ClientService service;
	
	@GetMapping("/client-info")
	public String ClientInfo(Model model) {
		
		
		
		model.addAttribute(model);
		
		return "info/client_info";
		
	}

}
