//package com.deepen.config;
//
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import com.deepen.entity.Employees;
//import com.deepen.repository.PersonnelRepository;
//
//import lombok.RequiredArgsConstructor;
//
//@RequiredArgsConstructor
//@Service
//public class MyUserDetailsService implements UserDetailsService {
//	
//	private final PersonnelRepository personnelRepository;
//	
//	@Override
//	public UserDetails loadUserByUsername(String emp_id) throws UsernameNotFoundException {
//		
//		Employees employees = personnelRepository.findById(emp_id).orElseThrow(() 
//				-> new UsernameNotFoundException("없는 회원")
//				);
//		
//		return User.builder()
//				.username(employees.getEmp_id())
//				.password(employees.getEmp_pw())
//				.roles("ROLE_" + employees.getEmp_role())
//				.build()
//				;
//
//	} 
//	
//	
//}
