package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.userdetails.User;
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
		return infoList;
	}
	
	public List<Map<String, Object>> selectStts() {
		return mapper.selectStts();
	}

	public List<Map<String, Object>> equipmentHstry(Map<String, Object> searchMap) {
		System.out.println(mapper.equipmentHstry(searchMap).toString());
		return mapper.equipmentHstry(searchMap);
	}

	public int saveData(User user, List<Map<String, Object>> saveDataList) {
		//[{hstyDate=2025-02-12, infoNo=2, hstyType=MNTP003, hstyDtl=ㄹㅇㄴㅁㄹㅇㄴ, hstyPrfr=상위관리자, regDate=null, mdfnDate=null, rowType=insert, rowKey=0
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			saveData.put("hstyPrfr", user.getUsername());
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = mapper.insert(saveData); 
				
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = mapper.update(saveData);
				
			} else {								// 삭제일 경우
				result = mapper.delete(saveData);
			}
		}
		
		System.out.println(saveDataList.toString());
		 return result;
	}

}
