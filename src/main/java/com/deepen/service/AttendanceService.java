package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.AttendanceMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class AttendanceService {
	
	private final AttendanceMapper attendanceMapper;
	
	
	// 휴직관리 ABSENCE_VIEW 리스트
	public List<Map<String, Object>> getAbsenceList() {
		
		return attendanceMapper.getAbsenceList();
	}
	
	
	

}
