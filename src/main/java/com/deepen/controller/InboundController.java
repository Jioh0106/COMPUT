package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.InboundService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class InboundController {
	
    private final InboundService inboundService;
    
    @GetMapping("/inbound")
    public String inbound() {
        
        return "inbound/inbound";
    }
	
    @GetMapping("/inboundPopup")
    public String inboundPopup() {
        
        return "inbound/inboundPopup";
    }

}