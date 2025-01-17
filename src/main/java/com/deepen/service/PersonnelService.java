package com.deepen.service;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.EmployeesDTO;
import com.deepen.entity.Employees;
import com.deepen.mapper.PersonnelMapper;
import com.deepen.repository.PersonnelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class PersonnelService {
	
	private final PersonnelRepository psRepo;
	
	// private final CommonDetailRepository cdRepo;
	
	private final PersonnelMapper psMapper;
	
	private final PasswordEncoder passwordEncoder;
	
	//JPA
	public void regEmployees(EmployeesDTO empDTO) {
		
		int newEmpNo = generateNewEmpNo();
		
		//사원 아이디
		DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyyMMdd");
		String id = format.format(empDTO.getEmp_hire_date())+newEmpNo; 
		//사원 초기 비밀번호
		String pw = empDTO.getMiddleEmpPhoneNo()+empDTO.getLastEmpPhoneNo();
		//사원 주민등록번호
		String ssn = empDTO.getFirst_emp_ssn()+"-"+empDTO.getSecond_emp_ssn();
		//사원 전화번호
		String phoneNum = empDTO.getFirstEmpPhoneNo()+"-"+empDTO.getMiddleEmpPhoneNo()+"-"+empDTO.getLastEmpPhoneNo();
		
		// 비밀번호 암호화
		String encodingPw = passwordEncoder.encode(pw);
		
		// 정보 설정
		empDTO.setEmp_id(id);
		
		empDTO.setEmp_pw(encodingPw);
//		empDTO.setEmp_pw(pw);
		
		empDTO.setEmp_no(newEmpNo);
		empDTO.setEmp_ssn(ssn);
		empDTO.setEmp_phone(phoneNum);
		empDTO.setEmp_reg_date(new Timestamp(System.currentTimeMillis()));
		
		Employees emp = Employees.setEmployees(empDTO);
		log.info(emp.toString());
		psRepo.save(emp);
	}
	
	private int generateNewEmpNo() {
	    // 데이터베이스에서 현재 가장 큰 emp_no 가져오기
	    Integer maxEmpNo = psRepo.findMaxEmpNo();
	    return (maxEmpNo != null) ? maxEmpNo + 1 : 1; // null인 경우 1부터 시작
	}
	
	public void updateEmpInfo(EmployeesDTO empDTO) {
		//사원 주민등록번호
		String ssn = empDTO.getFirst_emp_ssn()+"-"+empDTO.getSecond_emp_ssn();
		//사원 전화번호
		String phoneNum = empDTO.getFirstEmpPhoneNo()+"-"+empDTO.getMiddleEmpPhoneNo()+"-"+empDTO.getLastEmpPhoneNo();
		
		empDTO.setEmp_ssn(ssn);
		empDTO.setEmp_phone(phoneNum);
		empDTO.setEmp_mod_date(new Timestamp(System.currentTimeMillis()));
		
		Employees emp = Employees.setEmployees(empDTO);
		log.info("Service 수정 할 데이터 : "+emp.toString());
		psRepo.save(emp);
	}
	
	public void deleteAllEmpById(List<String> ids) {
		psRepo.deleteAllById(ids);
		log.info("삭제한 데이터 Ids : "+ids);
	}
	
	
	//Mybatis
	// 등록페이지 필요 공통코드 조회
	public List<CommonDetailDTO> fetchCommonDetailCodeList(){
		
		List<CommonDetailDTO> cdCodeList = psMapper.selectCommonDetailCodeList();
		
		return cdCodeList;
	}
	
	public List<Map<String, Object>> getEmpInfoList(String startDate, String endDate, String search){
		
		log.info("S fitter: "+startDate+", "+endDate+", "+search);
		
		Map<String, Object> params = new HashMap<>();
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("search", search);
		
		List<Map<String, Object>> empList = psMapper.selectEmpInfoList(params);
		
		return empList;
	}
	
	public List<Map<String, Object>> getEmpInfoById(String userId){
		log.info(userId);
		return psMapper.selectEmpInfoById(userId);
	}
	
	public List<Map<String , Object>> getCountByEdu(){
		return psMapper.countByEdu();
	}
	
	public List<Map<String , Object>> getInfoListByEdu(List<String> edu){
		List<Map<String , Object>> infoList = psMapper.selectInfoByEdu(edu);
		return infoList;
	}
	
	public List<Map<String, Object>> getCountByAgeGroupAndGender(){
		return psMapper.countByAgeGroupAndGender();
	}
	
	public List<Map<String, Object>> getInfoListByAgeGroup(List<String> gender){
		List<Map<String, Object>> infoList = psMapper.selectInfoByAgeGroup(gender);
		return infoList;
	}
	
	public List<Map<String, Object>> getCountByMonthlyHireExit(){
		return psMapper.countByMonthlyHireExit();
	}
	
	public List<Map<String, Object>> getInfoListByMonthlyHireExit(List<String> hireExit){
		return psMapper.selectInfoByMonthlyHireExit(hireExit);
	}
	
	public List<Map<String, Object>> getCountDeptListByPosition() {
		return null; //psMapper.countDeptByPosition();
	}
	
	public List<Map<String, Object>> getInfoListByDeptAndPosition(List<String> position){
		return null; //psMapper.selectDeptInfoByPosition(position);
	}
	
	public List<Map<String, Object>> getCountListByJobType() {
		return psMapper.countByJobType();
	}
	
	public List<Map<String, Object>> getInfoListByJobType(List<String> jobType){
		return psMapper.selectInfoByJobType(jobType);
	}
	
	public List<Map<String, Object>> getCountListByRank(){
		return psMapper.countByRank();
	}
	
	public List<Map<String, Object>> getInfoListByRank(List<String> rank){
		return psMapper.selectInfoByRank(rank);
	}
}

