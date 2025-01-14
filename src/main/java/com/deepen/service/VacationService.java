package com.deepen.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.VacationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VacationService {

	private final VacationMapper mapper;
	
	public Map<String, Object> selectEmpAthr(String userId) {
		return mapper.selectEmpAthr(userId);
	}
	
	public List<Map<String, Object>> selectUseVctnList(Map<String, Object> athrMapList) {
		
		Map<String, Object> map = mapper.selectEmpInfo(String.valueOf(athrMapList.get("empId")));

		// 역에 의한 계산으로 입사일~현재 근속연수 구하기
		String hireDate = (String) map.get("hireDate");

		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate startDate = LocalDate.parse(hireDate, dateFormatter);
		LocalDate endDate = LocalDate.now().plusDays(1);

		StringBuilder diffDate = new StringBuilder();

		// 초일산입 근속연수 (하루 더한 결과)
		int diffYears = startDate.until(endDate).getYears();
		int diffMonths = startDate.until(endDate).getMonths();
		int diffDays = startDate.until(endDate).getDays();

		// 전월 말일
		int lastDayOfMonth = endDate.minusMonths(1).lengthOfMonth();
		// 예외케이스 1.30 ~ 3.30 로 인 시작일 종료일의 일자 비교구문 추가
		if (startDate.getDayOfMonth() > lastDayOfMonth && startDate.getDayOfMonth() > endDate.getDayOfMonth()) {
			diffDays -= 1;
		}

		int workMonth = 0;

		if (diffYears > 0) {
			diffDate.append(diffYears).append("년 ");
			workMonth += diffYears * 12;
		}
		if (diffMonths > 0) {
			diffDate.append(diffMonths).append("개월 ");
			workMonth += diffMonths;
		}
		diffDate.append(diffDays).append("일");
		
		List<Map<String, Object>> useVctnList = mapper.selectUseVctnList(athrMapList);
		
		for(Map<String, Object> useVctn : useVctnList) {
			if (workMonth < 1) {
				useVctn.put("vctnDays", 0);

			} else if (workMonth >= 1 && workMonth < 12) {
				useVctn.put("vctnDays", workMonth - Integer.valueOf(String.valueOf(useVctn.get("useDays"))));

			} else if (workMonth >= 12) {
				useVctn.put("vctnDays", 15 - Integer.valueOf(String.valueOf(useVctn.get("useDays"))));
			}
		}
		
		return useVctnList;
	}
	
	public List<Map<String, Object>> selectVctnDaysList(Map<String, Object> athrMapList) {
		List<Map<String, Object>> vctnDaysList = mapper.selectVctnDaysList(athrMapList);
		
		for(Map<String, Object> vctnDays : vctnDaysList) {
			vctnDays.put("vctnDays", workDays(String.valueOf(athrMapList.get("empId"))));
		}
		
		return vctnDaysList;
	}

	public List<Map<String, Object>> selectCommonDtl() {
		return mapper.selectCommonDtl();
	}

	public Map<String, Object> selectEmpInfo(String userId) {
		Map<String, Object> map = mapper.selectEmpInfo(userId);
		
		map.put("vctnDays", workDays(userId));

		return map;
	}

	public List<Map<String, Object>> selectMiddleAprvr() {
		return mapper.selectMiddleAprvr();
	}

	public int insertVctn(Map<String, Object> vctnMap, Map<String, Object> rqstMap) {
		
		//vctnMap -> {type=VCTN001, startDate=2025-01-13, endDate=2025-01-31, total=15, leaveId=2025010928, aprvId=2025010416}
		//rqstMap -> {type=휴가, aprvId=2025010416, empId=2025010928}
		
		Map<String, Object> map = new HashMap<>();
		// 휴가 테이블 데이터
		map.put("vctnType", String.valueOf(vctnMap.get("type")));
		map.put("startDate", String.valueOf(vctnMap.get("startDate")));
		map.put("endDate", String.valueOf(vctnMap.get("endDate")));
		map.put("total", String.valueOf(vctnMap.get("total")));
		
		// 요청내역 테이블 데이터
		map.put("rqstType", String.valueOf(rqstMap.get("type")));
		map.put("status", "RQST001");
		
		// 요청자 및 중간승인권자
		map.put("leaveId", String.valueOf(vctnMap.get("leaveId")));
		map.put("aprvId", String.valueOf(vctnMap.get("aprvId")));
		
		int rqstNo = mapper.insertRequest(map); // 요청내역
		int result = mapper.insertVctn(map);	// 휴가
		
		return result;
	}
	
	public int workDays(String userId) {
		Map<String, Object> map = mapper.selectEmpInfo(userId);

		// 역에 의한 계산으로 입사일~현재 근속연수 구하기
		String hireDate = (String) map.get("hireDate");
		int total = Integer.valueOf(String.valueOf(map.get("total")));

		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate startDate = LocalDate.parse(hireDate, dateFormatter);
		LocalDate endDate = LocalDate.now().plusDays(1);

		StringBuilder diffDate = new StringBuilder();

		// 초일산입 근속연수 (하루 더한 결과)
		int diffYears = startDate.until(endDate).getYears();
		int diffMonths = startDate.until(endDate).getMonths();
		int diffDays = startDate.until(endDate).getDays();

		// 전월 말일
		int lastDayOfMonth = endDate.minusMonths(1).lengthOfMonth();
		// 예외케이스 1.30 ~ 3.30 로 인 시작일 종료일의 일자 비교구문 추가
		if (startDate.getDayOfMonth() > lastDayOfMonth && startDate.getDayOfMonth() > endDate.getDayOfMonth()) {
			diffDays -= 1;
		}

		int workMonth = 0;
		int vctnDays = 0;

		if (diffYears > 0) {
			diffDate.append(diffYears).append("년 ");
			workMonth += diffYears * 12;
		}
		if (diffMonths > 0) {
			diffDate.append(diffMonths).append("개월 ");
			workMonth += diffMonths;
		}
		diffDate.append(diffDays).append("일");

		if (workMonth < 1) {
			vctnDays = 0;

		} else if (workMonth >= 1 && workMonth < 12) {
			vctnDays = workMonth - total;

		} else if (workMonth >= 12) {
			vctnDays = 15 - total;
		}
		return vctnDays;
	}

}
