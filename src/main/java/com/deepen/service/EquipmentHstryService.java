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
		List<Map<String, Object>> infoList = mapper.equipmentInfo(searchMap);
		
		for(Map<String, Object> infoMap : infoList ) {
			String sn = String.valueOf(infoMap.get("sn"));
			String name = String.valueOf(infoMap.get("name"));
			infoMap.put("info", sn+"("+name+")");
		}
		System.out.println(infoList.toString() + " pppppppp");
		return infoList;
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

	public List<Map<String, Object>> equipmentHstry(Map<String, Object> searchMap) {
		System.out.println(mapper.equipmentHstry(searchMap).toString());
		return mapper.equipmentHstry(searchMap);
	}

	public int saveData(List<Map<String, Object>> saveDataList) {
		//[{hstyDate=2025-02-12, infoNo=2, hstyType=MNTP003, hstyDtl=ㄹㅇㄴㅁㄹㅇㄴ, hstyPrfr=상위관리자, regDate=null, mdfnDate=null, rowType=insert, rowKey=0
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = mapper.insert(saveData); 
				
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = mapper.update(saveData);
				
			} else {								// 삭제일 경우
				result = mapper.delete(saveData);
			}
		}
		
		 return result;
	}

}
