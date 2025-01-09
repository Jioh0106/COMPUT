package com.deepen.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.entity.Employees;
import com.deepen.mapper.AbsenceMapper;
import com.deepen.repository.PersonnelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class AbsenceService {
	
	private final AbsenceMapper attendanceMapper;
	
	
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
	
	// 특정 권한자 리스트 조회
	public List<Map<String, String>> getEmpList(String emp_role) {
		List<Map<String, String>> list = attendanceMapper.getEmpList(emp_role);
		log.info("AttendanceService - getEmpList : " + list);
		return list;
	}
	

	@Transactional
	public void insertRequest(Map<String, Object> map) {
		
		String role = (String)map.get("request_role");
		
		// 승인요청 수신자가 high 권한이면 1차 승인자에 본인 아이디, 요청 상태는 2차대기
		if(role.equals("ATHR001")) {
			map.put("middle_approval", (String)map.get("emp_id"));
			map.put("high_approval", (String)map.get("request_approval"));
			map.put("request_status", "RQST006");
		}
		
		// 아니라면 (middle이러면) 1차 승인자에 요청 수신자, 요청 상태는 1차 대기
		map.put("middle_approval", (String)map.get("request_approval"));
		map.put("request_status", "RQST005");
		
		int request_no = attendanceMapper.insertRequest(map);
		
		map.put("request_no", request_no);
		
		attendanceMapper.insertLoab(map);
		
		
	}





	
	
	

}
