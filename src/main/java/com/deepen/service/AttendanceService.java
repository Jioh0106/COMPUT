package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.mapper.AttendanceMapper;
import com.deepen.repository.CommonDetailRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class AttendanceService {
	
	private final AttendanceMapper attendanceMapper;
//	private final CommonDetailRepository commonDetailRepository;
	
	
	// 휴직관리 ABSENCE_VIEW 리스트 조회
	public List<Map<String, Object>> getAbsenceList() {
		
		return attendanceMapper.getAbsenceList();
	}

	// 공통코드 항목 조호ㅢ
	public List<CommonDetailDTO> getCommonList(String code) {
		List<CommonDetailDTO> list = attendanceMapper.getCommonList(code);
		log.info("AttendanceService - getCommonList : " + list);
		
		return list;
	}

	
	// 휴직신청서 통한 휴직 insert
	public void insertLoab(Map<String, Object> map) {
		//attendanceMapper.insertRequest(map.get(""));
		attendanceMapper.insertLoab(map);
		
	}




	
	
	

}
