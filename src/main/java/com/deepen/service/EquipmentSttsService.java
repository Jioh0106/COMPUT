package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.EquipmentSttsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class EquipmentSttsService {

	private final EquipmentSttsMapper mapper;

	public List<Map<String, Object>> selectStts() {
		return mapper.selectStts();
	}

	public List<Map<String, Object>> selectEquipmentStts(Map<String, Object> searchMap) {
		return mapper.selectEquipmentStts(searchMap);
	}


}
