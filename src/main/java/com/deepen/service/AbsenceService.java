package com.deepen.service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepen.domain.AbsenceDTO;
import com.deepen.domain.CommonDetailDTO;
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
	public void updateAbsences(List<Map<String, Object>> updatedRows, String emp_id) {
		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String absence_type = "";
		String absence_start ="";
		String absence_end ="";
		LocalDate localDate1 = null;
		LocalDate localDate2 = null;
		Date sqlDate1 = null;
		Date sqlDate2= null;
		
		for (Map<String, Object> row : updatedRows) {
			absence_type = (String) row.get("ABSENCE_TYPE");
			row.put("ABSENCE_TYPE", absenceMapper.getUpdateCommon(absence_type));
			
			absence_start = (String) row.get("ABSENCE_START");
			absence_end = (String) row.get("ABSENCE_END");
			
			 // 1. 문자열을 LocalDate로 파싱
	        localDate1 = LocalDate.parse(absence_start, dtf);
	        localDate2 = LocalDate.parse(absence_end, dtf);

	        // 2. LocalDate를 java.sql.Date로 변환
	        sqlDate1 = Date.valueOf(localDate1);
	        sqlDate2 = Date.valueOf(localDate2);
	        
	        row.put("ABSENCE_START", sqlDate1);
	        row.put("ABSENCE_END", sqlDate2);
	        row.put("UPDATE_EMP_ID", emp_id);
			
            absenceMapper.updateAbsence(row);
        }
	}
	
	// 휴직 테이블 추가(여러건)
	public void insertAbsences(List<Map<String, Object>> createdRows, String emp_role, String emp_id) {
		AbsenceDTO absence = new AbsenceDTO();
		RequestDTO request = new RequestDTO();
		String absence_type = "";
		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String absence_start ="";
		String absence_end ="";
		LocalDate localDate1 = null;
		LocalDate localDate2 = null;
		
		for (Map<String, Object> row : createdRows) {
			absence.setEmp_id((String)row.get("EMP_ID"));
			absence_type = (String) row.get("ABSENCE_TYPE");
			absence.setAbsence_type(absenceMapper.getUpdateCommon(absence_type));
			
			absence_start = (String) row.get("ABSENCE_START");
			absence_end = (String) row.get("ABSENCE_END");
			
	        localDate1 = LocalDate.parse(absence_start, dtf);
	        localDate2 = LocalDate.parse(absence_end, dtf);

			absence.setAbsence_start(localDate1);
			absence.setAbsence_end(localDate2);
			absence.setAbsence_remark((String) row.get("ABSENCE_REMARK"));
			
			request.setRequest_type("휴직");
			request.setEmp_id(emp_id);
			
			
			if(emp_role.equals("ATHR001")) {
				request.setHigh_approval(emp_id);
				request.setRequest_status("RQST005");
			} else {
				request.setMiddle_approval(emp_id);
				request.setHigh_approval((String)row.get("HIGH_APPROVAL"));
				request.setRequest_status("RQST003");
			}
			
			row.remove("REQUEST_DATE");
			
			insertAbsenceAndRequest(request, absence);
			
        }
	}
	
	// 휴직 신청서 제출 통한 insert (absence 테이블, request 테이블)
	@Transactional
	public void insertAbsenceAndRequest(RequestDTO requestDTO, AbsenceDTO absenceDTO) {
		
		Request request = Request.requestDTOToEntity(requestDTO);
		Absence absence = Absence.absenceDTOToEntity(absenceDTO);
		
		requestRepository.save(request);
		
		log.info("request.getRequest_no() = " + request.getRequest_no());
		
		absence.setRequest_no(request.getRequest_no());
		absenceRepository.save(absence);
		
		
	}
	
	// 최종승인자가 본인일 때 정보 가져오기
	public Map<String, String> getEmpSelf(String emp_id) {
		return absenceMapper.getEmpSelf(emp_id);
	}
	
	// 모달창 사원 조회
	public List<Map<String, String>> getEmpSerch(String emp_name) {
		return absenceMapper.getEmpSerch(emp_name);
	}

	






	
}