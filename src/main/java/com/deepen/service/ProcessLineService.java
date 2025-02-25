package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.ProcessLineMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class ProcessLineService {

	private final ProcessLineMapper plMapper;
	
	public List<Map<String, Object>> processInfo(Map<String, Object> searchMap) {
		return plMapper.processInfo(searchMap);
	}

	public int saveProcessData(List<Map<String, Object>> saveDataList) {
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = plMapper.processInsert(saveData); 
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = plMapper.processUpdate(saveData);
			} else {								// 삭제일 경우
				result = plMapper.processDelete(saveData);
			}
		}
		
		 return result;
	}
	 
	public List<Map<String, Object>> lineInfo(Map<String, Object> searchMap) {
		log.info(plMapper.processInfo(searchMap).toString());
		return plMapper.lineInfo(searchMap);
	}

	public int saveLineData(List<Map<String, Object>> saveDataList) {
		log.info(saveDataList.toString());
		int result = 0;
		
		for(Map<String, Object> saveData : saveDataList) {
			
			String rowType = String.valueOf(saveData.get("rowType"));
			
			if(rowType.equals("insert")) { 			// 추가일 경우
				result = plMapper.lineInsert(saveData); 
			} else if(rowType.equals("update")) {	// 수정일 경우
				result = plMapper.lineUpdate(saveData);
			} else {								// 삭제일 경우
				result = plMapper.lineDelete(saveData);
			}
		}
		
		 return result;
	}

}
