package com.deepen.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.VacationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VacationService {

	private final VacationMapper mapper;

	public List<Map<String, Object>> selectCommonDtl() {
		return mapper.selectCommonDtl();
	}

	public Map<String, Object> selectEmpInfo(String userId) {
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
			map.put("vctnDays", 0);

		} else if (workMonth >= 1 && workMonth < 12) {
			map.put("vctnDays", workMonth - total);

		} else if (workMonth >= 12) {
			map.put("vctnDays", 15 - total);
		}

		return map;
	}

	public List<Map<String, Object>> selectMiddleAprvr() {
		return mapper.selectMiddleAprvr();
	}

}
