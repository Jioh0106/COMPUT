package com.deepen.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.WorkAddDTO;
import com.deepen.domain.WorkDTO;
import com.deepen.domain.WorkTmpDTO;
import com.deepen.entity.Employees;
import com.deepen.entity.WorkTmp;
import com.deepen.mapper.WorkMapper;
import com.deepen.repository.PersonnelRepository;
import com.deepen.repository.WorkTmpRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class WorkService {
	
	private final PersonnelRepository personnelRepository;
	private final WorkTmpRepository workTmpRepository;
	private final WorkMapper workMapper;
	
	// 근무 관리 - 사용자 정보 조회
	public Optional<Employees> findById(String emp_id) {
		return personnelRepository.findById(emp_id);
	}
	
	// 근무 일정 등록 - 근무 템플릿 조회
	public List<WorkTmp> findAll() {
		return workTmpRepository.findAll();
	}
	
	
	// 근무 일정 등록 - 직원 조회
	public List<Map<String, String>> getEmpSerch(Map<String, String> serchEmpInfo) {
		return workMapper.getEmpSerch(serchEmpInfo);
	} // getEmpSerch
	
	
	// 근무 일정 등록 - 일정 추가 시 해당 직원/근무일에 기존 데이터 존재 여부 체크
	public List<WorkDTO> ckeckWork(WorkAddDTO appendData) {
		
		List<WorkDTO> existWork = new ArrayList<>();
		WorkDTO work = new WorkDTO();
		
		for(String day : appendData.getWeekdays()) {
			// 선택된 날짜 기간 조회
				
			for(Map<String, Object> row : appendData.getRows()) {
				// 선택된 사원 배열 조회
				work = workMapper.ckeckWork((String)row.get("EMP_ID"), day);
				if(work != null) {
					existWork.add(work);
				}
			}
			
		}
		
		return existWork;
		
	} // ckeckWork
	

	public void insertWork(WorkAddDTO appendData) {
		WorkDTO work = new WorkDTO();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
		LocalDate localDate = null;
		
		for(String day : appendData.getWeekdays()) {
			localDate = LocalDate.parse(day, formatter); 
			
			for(Map<String, Object> row : appendData.getRows()) {
				work.setEmp_id((String) row.get("EMP_ID"));
				work.setWork_date(localDate);
				
			}
		}
		
	} // insertWork

	


}



