package com.deepen;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.deepen.mapper.PersonnelMapper;

@SpringBootTest
class DeepenTeam1ProjectApplicationTests {
	
//	private final CommonDetailRepository commonDetailRepository;
	@Autowired
	private PersonnelMapper mapper;

	@Test
	void contextLoads() {
		
		mapper.selectCommonDetailCodeList();
	}

}
