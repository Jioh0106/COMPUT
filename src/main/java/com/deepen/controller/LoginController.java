package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class LoginController {
	
	@GetMapping("/login")
	public String login(HttpServletRequest request, Model model) {
		String rememberedId = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("rememberedId".equals(cookie.getName())) {
                    rememberedId = cookie.getValue(); // 쿠키 값 가져오기
                    break;
                }
            }
        }
        System.out.println("LoginController - rememberedId = " + rememberedId);
        model.addAttribute("rememberedId", rememberedId);
		return "login";
	}
	
	
	
	
}
