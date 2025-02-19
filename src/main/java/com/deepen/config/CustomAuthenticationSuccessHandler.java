package com.deepen.config;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler  {
	@Autowired
	private final EmployeeLookupService employeeLookupService;
	
	public CustomAuthenticationSuccessHandler(EmployeeLookupService employeeLookupService) {
        this.employeeLookupService = employeeLookupService;
    }
	
	
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
                                        throws IOException, ServletException {
    	
    	System.out.println("🔵 CustomAuthenticationSuccessHandler 실행됨!");

	    String rememberMe = Optional.ofNullable(request.getParameter("rememberMe")).orElse("off");
	    System.out.println("CustomAuthenticationSuccessHandler - rememberMe = " + rememberMe );
	    
	    String emp_id = authentication.getName();
	    Map<String, Object> emp = employeeLookupService.getEmployeeById(emp_id);

	    HttpSession session = request.getSession();
	    session.setAttribute("sEmp", emp);
	    session.setMaxInactiveInterval(-1);
	    System.out.println("sEmp = " + session.getAttribute("sEmp"));

	    try {
	        if ("on".equals(rememberMe)) {
	            Cookie cookie = new Cookie("rememberedId", emp_id);
	            cookie.setMaxAge(7 * 24 * 60 * 60);
	            cookie.setPath("/");
	            cookie.setHttpOnly(true);
	            response.addCookie(cookie);
	            System.out.println("✅ 쿠키 저장됨: rememberedId = " + emp_id);
	        } else {
	            Cookie deleteCookie = new Cookie("rememberedId", "");
	            deleteCookie.setMaxAge(0);
	            deleteCookie.setPath("/");
	            response.addCookie(deleteCookie);
	            System.out.println("🛑 쿠키 삭제됨: rememberedId");
	        }

	        // 응답이 이미 커밋되었는지 확인
	        if (response.isCommitted()) {
	            System.out.println("🚨 응답이 이미 커밋되었음! sendRedirect() 실행 불가");
	            return;
	        }

	        System.out.println(" 로그인 성공, /로 리다이렉트 실행");
	        response.sendRedirect("/");
	    } catch (Exception e) {
	        System.out.println("🚨 CustomAuthenticationSuccessHandler 예외 발생: " + e.getMessage());
	        e.printStackTrace();
	    }

        
    }
}
