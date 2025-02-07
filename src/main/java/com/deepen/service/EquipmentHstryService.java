package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.EquipmentHstryMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class EquipmentHstryService {

	private final EquipmentHstryMapper mapper;

	public List<Map<String, Object>> yearMonthList() {
		return mapper.yearMonthList();
	}
	
	public List<Map<String, Object>> equipmentInfo(Map<String, Object> searchMap) {
		return mapper.equipmentInfo(searchMap);
	}
	
	public List<Map<String, Object>> clientInfo() {
		return mapper.clientInfo();
	}
	
	public List<Map<String, Object>> selectStts() {
		return mapper.selectStts();
	}

	public int eqpSaveData(List<Map<String, Object>> saveDataList) {
		//[{no=, sn=754903, name=비싼기계, kind=절삭, mnfct=사장님이 미쳤어요, buy=2025-01-13, set=2025-01-22, useYn=Y, rowType=insert}]/
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = mapper.eqpInsert(saveData); 
				
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = mapper.eqpUpdate(saveData);
				
			} else {								// 삭제일 경우
				result = mapper.eqpDelete(saveData);
			}
		}
		
		 return result;
	}

}
