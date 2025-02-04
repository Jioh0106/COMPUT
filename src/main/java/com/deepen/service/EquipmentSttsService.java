package com.deepen.service;

import java.util.ArrayList;
import java.util.Arrays;
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
		Object valueObj = searchMap.get("value"); // Object로 가져오기

	    List<String> valueList = new ArrayList<>();

	    if (valueObj instanceof String) {
	        String valueStr = ((String) valueObj).replaceAll("[\\[\\]]", "").trim(); // [] 제거 및 공백 제거
	        if (!valueStr.isEmpty() && !"null".equalsIgnoreCase(valueStr)) {
	            valueList = Arrays.asList(valueStr.split("\\s*,\\s*")); // 쉼표로 구분하여 리스트로 변환
	        }
	    } else if (valueObj instanceof List) {
	        valueList = (List<String>) valueObj; // 이미 리스트 형태면 그대로 사용
	    }

	    searchMap.put("valueList", valueList); // ✅ MyBatis에서 사용 가능하도록 valueList 추가
	    searchMap.put("valueListSize", valueList.size()); // ✅ valueListSize도 추가
		
		System.out.println(valueList.toString());
		return mapper.selectEquipmentStts(searchMap);
	}


}
