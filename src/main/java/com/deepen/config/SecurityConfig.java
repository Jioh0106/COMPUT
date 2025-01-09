package com.deepen.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.debug.SecurityDebugBeanFactoryPostProcessor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	private final MyUserDetailsService myUserDetailsService;
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
		
		
		return security
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(authorizeHttpRequestCustomizer -> authorizeHttpRequestCustomizer
						.requestMatchers("/login/**","/css/**", "/js/**", "/images/**", "/webjars/**", "/mapTest/**", "/assets/**", "/ps-list/**", "/ps-reg/**")
						.permitAll()
						.requestMatchers("/", "/request-list/**", "/ps-empDb/**", "/ps-hrDb/**", "/assign-stts/**", "/assign-insert/**", 
											 "/cmt-stts/**", "/vctn-mng/**", "/loab-mng/**", "/work-mng/**","/pay-stts/**", "/pay-list/**", "/pay-mng/**")
						.hasAnyRole("ATHR001", "ATHR002", "ATHR003")
						.requestMatchers("/common-mng/**")
						.hasRole("ATHR001")
						.anyRequest()
						.authenticated()
						)
				.formLogin(formLoginCustomizer
						-> formLoginCustomizer
						.loginPage("/login")
						.loginProcessingUrl("/loginPro")
						.usernameParameter("emp_id")
						.passwordParameter("emp_pw")
						.defaultSuccessUrl("/")
						.failureUrl("/login")
						)
				.logout(logoutCustomizer
						-> logoutCustomizer
						.logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
						.logoutSuccessUrl("/")
						)
				.userDetailsService(myUserDetailsService)
				.build();
	}
	
	@Bean
	public static SecurityDebugBeanFactoryPostProcessor securityDebugBeanFactoryPostProcessor() {
	    return new SecurityDebugBeanFactoryPostProcessor();
	}


	
}
