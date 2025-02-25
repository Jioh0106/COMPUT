package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class InboundController {
	
    @GetMapping("/inbound")
    public String inbound() {
        return "inbound/inbound";
    }
	
    @GetMapping("/inboundPopup")
    public String inboundPopup() {
        return "inbound/inboundPopup";
    }

}