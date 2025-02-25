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
		String getChk = String.valueOf(searchMap.get("checkboxes")); // 
		String chk = getChk.replaceAll("[\\[\\]]", "").trim(); // [] 제거 및 공백 제거

	    List<String> chkList = new ArrayList<>();

        if (!chk.isEmpty() && !chk.equals("null")) {
        	chkList = Arrays.asList(chk.split("\\s*,\\s*")); // 쉼표로 구분하여 리스트로 변환
        } 

        // mapper에서 사용하기 위한 추가
	    searchMap.put("chkList", chkList); // foreach 돌릴 valueList 추가
	    searchMap.put("chkListSize", chkList.size()); // if에서 사용할 리스트 size 추가
		
		return mapper.selectEquipmentStts(searchMap);
	}


}
