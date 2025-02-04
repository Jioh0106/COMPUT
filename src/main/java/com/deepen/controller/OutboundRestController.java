package com.deepen.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.service.InboundService;
import com.deepen.service.OutboundService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/outbound")
@Log
public class OutboundRestController {
	
	private final OutboundService outboundService;
	
	
	
	
	
	
} 