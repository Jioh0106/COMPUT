package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.mapper.AttendanceMapper;

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

	// 공통코드 항목 조회
	public List<CommonDetailDTO> getCommonList(String code) {
		List<CommonDetailDTO> list = attendanceMapper.getCommonList(code);
		log.info("AttendanceService - getCommonList : " + list);
		
		return list;
	}

	


	public List<EmployeesDTO> getEmpList(String emp_role) {
		List<EmployeesDTO> list = attendanceMapper.getEmpList(emp_role);
		log.info("AttendanceService - getEmpList : " + list);
		return list;
	}

	public int insertRequest(Map<String, String> map) {
		// 요청 테이블에 먼저 추가 후 요청 번호 리턴 
		attendanceMapper.insertRequest(map);
		
		
		return 0;
	}

	// 휴직신청서 통한 휴직 insert
	public void insertLoab(Map<String, String> map) {
		// 요청 번호 받아서 추가 
		attendanceMapper.insertLoab(map);
		
	}


	
	
	

}
