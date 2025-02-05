package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.ProcessLineMapper;
import com.deepen.mapper.WorkInstructionMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class WorkInstructionService {
	private final WorkInstructionMapper wiMapper;
	
	public List<Map<String, Object>> getWorkerListByPosition(){
		return wiMapper.selectWokerInfoListByPosition();
	}

}
