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
//				//,"/ps-reg","/restApi/**","/registClose","/ps-list" => 아이디 없는 상태에서 등록하려면 permitAll()에 추가
//				//.csrf().disable() // 아이디 넣기 위한 CSRF 토큰 비활성화(임시방편) -> 보안에 취약해짐
//				.authorizeHttpRequests(authorizeHttpRequestCustomizer -> authorizeHttpRequestCustomizer
//						.requestMatchers("/login/**","/css/**", "/js/**", "/images/**", "/webjars/**", "/mapTest/**", "/assets/**")
//						.permitAll()
//						.requestMatchers("/", "/request-list/**", "/ps-list/**","/ps-empDb","/ps-hrDb","/assign-stts/**", "/assign-insert/**", 
//											 "/cmt-stts/**", "/vctn-mng/**", "/loab-mng/**", "/work-mng/**","/pay-stts/**", "/pay-list/**", "/pay-mng/**")
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
