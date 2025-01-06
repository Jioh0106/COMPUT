package com.deepen;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.deepen.mapper.PersonnelMapper;
import com.deepen.service.PersonnelService;

@SpringBootTest
class DeepenTeam1ProjectApplicationTests {
	
//	private final CommonDetailRepository commonDetailRepository;
	@Autowired
	private PersonnelMapper mapper;
	
	@Autowired
	private PersonnelService service;

	@Test
	void contextLoads() {
		
//		mapper.selectCommonDetailCodeList();
//		mapper.selectEmpList();
//		service.getEmpList();
	}

}
