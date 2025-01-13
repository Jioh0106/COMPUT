package com.deepen;

import java.util.ArrayList;
import java.util.List;

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
//		mapper.countByAgeGroupAndGender();
//		mapper.selectByAgeGroupInfo("30대");
		List<String> test = new ArrayList<>();
		test.add("학사");
		test.add("석사");
		
		mapper.selectInfoByEdu(test);
//		service.getEmpList();
	}

}
