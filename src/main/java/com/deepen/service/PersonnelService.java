package com.deepen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.mapper.PersonnelMapper;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.PersonnelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class PersonnelService {
	
	private final PersonnelRepository empRepo;
	private final CommonDetailRepository cdRepo;
	private final PersonnelMapper psMapper;
	
	
	//JPA
	
	
	
	
	
	//Mybatis
	// 등록페이지 필요 공통코드 조회
	public List<CommonDetailDTO> fetchCommonDetailCodeList(){
		
		List<CommonDetailDTO> cdCodeList = psMapper.selectCommonDetailCodeList();
		
		return cdCodeList;
	}
	

}

