package com.deepen.service;

import org.springframework.stereotype.Service;

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
	
	
	

}

