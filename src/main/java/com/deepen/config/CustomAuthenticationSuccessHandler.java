package com.deepen.config;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
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
    	
        String emp_id = authentication.getName();
        Map<String, Object> emp = employeeLookupService.getEmployeeById(emp_id);
        
        HttpSession session = request.getSession();
        session.setAttribute("sEmp", emp);
        session.setMaxInactiveInterval(-1);
        System.out.println("sEmp = " + session.getAttribute("sEmp"));
        
        // 로그인 성공 후 "/" 메인 페이지로 리다이렉트
        response.sendRedirect("/");
        
    }
        
}
