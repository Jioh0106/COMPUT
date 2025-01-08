//package com.deepen.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
//
//import lombok.RequiredArgsConstructor;
//
//@RequiredArgsConstructor
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//	
//	private final MyUserDetailsService myUserDetailsService;
//	
//	@Bean
//	public PasswordEncoder passwordEncoder() {
//		return new BCryptPasswordEncoder();
//	}
//	
//	
//	@Bean
//	public SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
//		
//		
//		return security
//				.authorizeHttpRequests(authorizeHttpRequestCustomizer -> authorizeHttpRequestCustomizer
//						.requestMatchers("/login/**","/css/**", "/js/**", "/images/**", "/webjars/**", "/mapTest/**", "/assets/**")
//						.permitAll()
//						.requestMatchers("/memberInfo/**", "/memberUpdate/**", "/memberDelete/**", 
//											 "/boardWrite/**", "/boardUpdate/**", "/boardDelete/**")
//						.hasAnyRole("HIGH", "MIDDLE", "LOW")
//						.requestMatchers("/common-mng/**")
//						.hasRole("HIGH")
//						.anyRequest()
//						.authenticated()
//						)
//				.formLogin(formLoginCustomizer
//						-> formLoginCustomizer
//						.loginPage("/login")
//						.loginProcessingUrl("/loginPro")
//						.usernameParameter("emp_id")
//						.passwordParameter("emp_pw")
//						.defaultSuccessUrl("/")
//						.failureUrl("/login")
//						)
//				.logout(logoutCustomizer
//						-> logoutCustomizer
//						.logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
//						.logoutSuccessUrl("/"))
//				.userDetailsService(myUserDetailsService)
//				.build();
//	}
//	
//	
//}
