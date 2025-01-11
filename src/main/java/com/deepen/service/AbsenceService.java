package com.deepen.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepen.domain.AbsenceDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.entity.Absence;
import com.deepen.entity.Employees;
import com.deepen.entity.Request;
import com.deepen.mapper.AbsenceMapper;
import com.deepen.repository.AbsenceRepository;
import com.deepen.repository.PersonnelRepository;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class AbsenceService {
	
	private final AbsenceMapper absenceMapper;
	private final AbsenceRepository absenceRepository;
	private final PersonnelRepository personnelRepository;
	private final RequestRepository requestRepository;
	
	
	// 휴직관리 ABSENCE_VIEW 리스트 조회
	public List<Map<String, Object>> getAbsenceList() {
		
		return absenceMapper.getAbsenceList();
	}

	// 공통코드 항목 조회
	public List<CommonDetailDTO> getCommonList(String code) {
		List<CommonDetailDTO> list = absenceMapper.getCommonList(code);
		log.info("AttendanceService - getCommonList : " + list);
		
		return list;
	}
	
	// 특정 권한자 리스트 조회
	public List<Map<String, String>> getEmpList(String emp_role) {
		List<Map<String, String>> list = absenceMapper.getEmpList(emp_role);
		log.info("AttendanceService - getEmpList : " + list);
		return list;
	}
	
	// 로그인한 사용자 정보 조회
	public Optional<Employees> findById(String emp_id) {
		
		return personnelRepository.findById(emp_id);
	}

	
	// 휴직 테이블 삭제(여러건)
	public void deleteAbsences(List<Integer> deleteList) {
		absenceMapper.deleteAbsences(deleteList);
	}
	
	// 휴직 테이블 업데이트(여러건)
	public void updateAbsences(List<Map<String, Object>> updatedRows) {
		for (Map<String, Object> row : updatedRows) {
            absenceMapper.updateAbsence(row);
        }
	}
	
	// 휴직 테이블 추가(여러건)
	public void insertAbsences(List<Map<String, Object>> createdRows) {
		for (Map<String, Object> row : createdRows) {
            absenceMapper.insertAbsence(row);
        }
	}
	
	@Transactional
	public void insertAbsenceAndRequest(RequestDTO requestDTO, AbsenceDTO absenceDTO) {
		
		Request request = Request.requestDTOToEntity(requestDTO);
		Absence absence = Absence.absenceDTOToEntity(absenceDTO);
		
		requestRepository.save(request);
		
		log.info("request.getRequest_no() = " + request.getRequest_no());
		
		absence.setRequest_no(request.getRequest_no());
		absenceRepository.save(absence);
		
		
	}







	
}