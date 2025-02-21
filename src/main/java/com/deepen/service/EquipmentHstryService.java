package com.deepen.service;

import java.util.ArrayList;
import java.util.Arrays;
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
		String getChk = String.valueOf(searchMap.get("checkboxes")); // 
		String chk = getChk.replaceAll("[\\[\\]]", "").trim(); // [] 제거 및 공백 제거

	    List<String> chkList = new ArrayList<>();

        if (!chk.isEmpty() && !chk.equals("null")) {
        	chkList = Arrays.asList(chk.split("\\s*,\\s*")); // 쉼표로 구분하여 리스트로 변환
        } 

        // mapper에서 사용하기 위한 추가
	    searchMap.put("chkList", chkList); // foreach 돌릴 valueList 추가
	    searchMap.put("chkListSize", chkList.size()); // if에서 사용할 리스트 size 추가
	    System.out.println(searchMap.toString());
		return mapper.equipmentHstry(searchMap);
	}

	public int saveData(User user, List<Map<String, Object>> saveDataList) {
		//[{hstyDate=2025-02-12, infoNo=2, hstyType=MNTP003, hstyDtl=ㄹㅇㄴㅁㄹㅇㄴ, hstyPrfr=상위관리자, regDate=null, mdfnDate=null, rowType=insert, rowKey=0
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			String hstyType = String.valueOf(saveData.get("hstyType"));
			saveData.put("hstyPrfr", user.getUsername());
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = mapper.insert(saveData);
				mapper.updateStts(saveData);
				
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = mapper.update(saveData);
				mapper.updateStts(saveData);
				
			} else {								// 삭제일 경우
				result = mapper.delete(saveData);
			}
		}
		
		System.out.println(saveDataList.toString());
		 return result;
	}

}
