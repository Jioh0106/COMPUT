package com.deepen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class DeepenTeam1ProjectApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(DeepenTeam1ProjectApplication.class, args);
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		// return 문 뒤에 SpringApplicationBuilder 객체의 sources() 메서드 호출하여
		// 메이클래스를 파라미터로 지정
		return builder.sources(DeepenTeam1ProjectApplication.class);
	}
	

}
