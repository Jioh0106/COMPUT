package com.deepen.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.config.EmployeeLookupService;
import com.deepen.mapper.MainMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LoginService implements EmployeeLookupService {
	
	private final MainMapper mapper;
	
	@Override
    public Map<String, Object> getEmployeeById(String emp_id) {
		 
		return mapper.getLoginEmp(emp_id);
    }
	
}
