package com.deepen.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.deepen.domain.ScheduleDTO;
import com.deepen.domain.WorkAddDTO;
import com.deepen.domain.WorkDTO;
import com.deepen.entity.Employees;
import com.deepen.entity.Work;
import com.deepen.entity.WorkTmp;
import com.deepen.mapper.WorkMapper;
import com.deepen.repository.PersonnelRepository;
import com.deepen.repository.WorkRepository;
import com.deepen.repository.WorkTmpRepository;

import jakarta.transaction.Transactional;
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
	} // findById
	
	// 근무 일정 등록 - 근무 템플릿 조회
	public List<WorkTmp> tmpFindAll() {
		return workTmpRepository.findAll();
	} //  // insertWork
	
	
	// 근무 일정 등록 - 직원 조회
	public List<Map<String, String>> getEmpSerch(Map<String, String> serchEmpInfo) {
		
		return workMapper.getEmpSerch(serchEmpInfo);
		
	} // getEmpSerch
	
	
	// 근무 일정 등록 - 일정 추가 시 해당 직원/근무일에 기존 데이터 존재 여부 체크
	public List<WorkDTO> ckeckWork(WorkAddDTO appendData) {
	    List<WorkDTO> list = new ArrayList<>();
	    
	    for (String day : appendData.getWeekdays()) {
	        // 선택된 날짜 기간 조회
	        for (Map<String, Object> row : appendData.getRows()) {
	            // 선택된 사원 배열 조회
	            WorkDTO work = workMapper.ckeckWork((String) row.get("EMP_ID"), day);
	            if (work != null) {
	            	list.add(work); 
	            }
	        }
	    }
	    
	    // Stream API를 활용해 중복 제거
	    return list.stream().distinct().collect(Collectors.toList());
                
	    
	} // ckeckWork
	
	@Transactional
	public void insertWork(WorkAddDTO appendData) {
		log.info("WorkService/insertWork - appendData " + appendData);
		
		
		WorkDTO work = new WorkDTO();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // 입력 문자열 형식
		LocalDate localDate = null;
		 
		for(String day : appendData.getWeekdays()) {
			// 선택된 날짜 기간 조회
			localDate = LocalDate.parse(day, formatter); 
				
			for(Map<String, Object> row : appendData.getRows()) {
				// 선택된 사원 배열 조회
				work.setEmp_id((String)row.get("EMP_ID"));
				work.setWork_date(localDate);
				work.setWork_tmp_name(appendData.getTmp());
				log.info(work.toString());
				
				workMapper.insertWork(work);
				
			}
			
		}
		
		
	} // insertWork
	
	
	
	// 근무관리 근무뷰 초기 데이터
	public List<WorkDTO> getWorkList(Map<String, String> map) {
		
		return workMapper.getWorkList(map) ;
		
	}  // getWorkList
	
	
	// 근무관리 근무뷰 검색결과
	public List<WorkDTO> getWorkListSerch(Map<String, String> map) {
		
		return workMapper.getWorkListSerch(map);
		
	} // getWorkListSerch
	
	
	
	// 근무일정 캘린더 일정 가져오기
	public List<ScheduleDTO> getSchedulesBetween(Map<String, String> map) {
		
		List<WorkDTO> workList = workMapper.getWorkList(map);
		List<ScheduleDTO> shcdList = new ArrayList<>();
		
		for(int i = 0; i < workList.size(); i++) {
			WorkDTO work = workList.get(i);
			ScheduleDTO schd = ScheduleDTO.workToSchd(work, String.valueOf(i+1));
			shcdList.add(schd);
		}
		
		
		return shcdList;
		
	} // getSchedulesBetween




	


} // WorkService



