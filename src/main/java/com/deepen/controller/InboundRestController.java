package com.deepen.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.service.InboundService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inbound")
@Log
public class InboundRestController {
	
	private final InboundService inboundService;
	
	
	
	
	
	
} 