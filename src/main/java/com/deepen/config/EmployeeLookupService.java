package com.deepen.config;

import java.util.Map;

public interface EmployeeLookupService {
	Map<String, Object> getEmployeeById(String emp_id);
}
