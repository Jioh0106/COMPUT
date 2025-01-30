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

	public int eqpSaveData(List<Map<String, Object>> saveDataList) {
		//[{no=, sn=754903, name=비싼기계, kind=절삭, mnfct=사장님이 미쳤어요, buy=2025-01-13, set=2025-01-22, useYn=Y, rowType=insert}]
		int result = 0;
		System.out.println(saveDataList.toString());
		for(Map<String, Object> saveData : saveDataList) {
			String rowType = String.valueOf(saveData.get("rowType"));
			if(rowType.equals("insert")) {
				result = mapper.eqpInsert(saveData); 
			} else if(rowType.equals("update")) {
				result = mapper.eqpUpdate(saveData);
			} else {
				result = mapper.eqpDelete(saveData);
			}
		}
		 return result;
	}
	 


}
