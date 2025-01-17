package com.deepen.config;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.deepen.entity.Employees;
import com.deepen.repository.PersonnelRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class MyUserDetailsService implements UserDetailsService {
	
	private final PersonnelRepository personnelRepository;
	
	@Override
	public UserDetails loadUserByUsername(String emp_id) throws UsernameNotFoundException {
		
//		Employees employees = personnelRepository.findById(emp_id).orElseThrow(() 
//				-> new UsernameNotFoundException("없는 회원")
//				);
		System.out.println("로그인 시도 - 사원번호: " + emp_id);
		
		Employees employees = personnelRepository.findById(emp_id)
		        .orElseThrow(() -> {
		        	
		            System.out.println("없는 회원: " + emp_id);
		            
		            return new UsernameNotFoundException("없는 회원: " + emp_id);
		        });

		System.out.println("로그인 성공 - 사원번호: " + employees.getEmp_id());

		
		return User.builder()
				.username(employees.getEmp_id())
				.password(employees.getEmp_pw())
				.roles(employees.getEmp_role())
				.build()
				;

	} 
	
	
}
