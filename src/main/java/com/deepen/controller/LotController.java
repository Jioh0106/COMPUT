package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class LotController {

    @GetMapping("/lot-tracking")
    public String lotTracking(Model model) {
        return "lot/lot_tracking";
    }
}