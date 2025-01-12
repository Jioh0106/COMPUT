package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.CommuteMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommuteService {
	
	private final CommuteMapper mapper;
	
	public Map<String, Object> selectEmpAthr(String userId) {
		return mapper.selectEmpAthr(userId);
	}

	public List<Map<String, Object>> selectAthrList(String athr) {
		return mapper.selectAthrList(athr);
	}

	public List<Map<String, Object>> selectCmtList(Map<String, Object> athrMapList) {
		System.out.println(athrMapList + " // service");
		return mapper.selectCmtList(athrMapList);
	}

}
