package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.service.InboundService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class InboundController {
	
    private final InboundService inboundService;
    
    //입고 관리
    @GetMapping("/inbound")
    public String inbound() {
        
        return "inbound/inbound";
    }
	
    //입고 등록 팝업
    @GetMapping("/inboundPopup")
    public String inboundPopup() {
        
        return "inbound/inboundPopup";
    }

}