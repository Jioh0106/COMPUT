package com.deepen.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.entity.Client;
import com.deepen.service.ClientService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class ClientController {
	
	/** 거래처 서비스 */
	private final ClientService service;
	
	/**
	 * 초기 화면
	 * @view model
	 * @return String
	 */
	@GetMapping("/client-info")
	public String ClientInfo(Model model) {
		
		List<Client> clientList = service.clientList();
		model.addAttribute("clientList", clientList);
		
		return "info/client_info";
		
	}

}
