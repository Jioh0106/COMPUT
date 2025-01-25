package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.EquipmentInfoMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class EquipmentInfoService {

	private final EquipmentInfoMapper mapper;

	public List<Map<String, Object>> yearMonthList() {
		return mapper.yearMonthList();
	}
	
	public List<Map<String, Object>> equipmentInfo(Map<String, Object> searchMap) {
		return mapper.equipmentInfo(searchMap);
	}

	/*
	 * public int saveData(List<Map<String, Object>> saveDataList) { return
	 * mapper.saveData(saveDataList); }
	 */


}
