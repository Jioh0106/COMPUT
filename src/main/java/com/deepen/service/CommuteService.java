package com.deepen.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.CommuteMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommuteService {
	
	private final CommuteMapper mapper;
	
	public Map<String, Object> selectEmpAthr(String userId) {
		return mapper.selectEmpAthr(userId);
	}

	public List<Map<String, Object>> selectAthrList(String athr) {
		return mapper.selectAthrList(athr);
	}

	public List<Map<String, Object>> selectCmtList(Map<String, Object> athrMapList) {
		return mapper.selectCmtList(athrMapList);
	}

	public Map<String, Object> mainCmt(Map<String, Object> searchMap) {
		
		List<Map<String, Object>> workList = mapper.selectWorkList(searchMap);
		Map<String, Object> cmtData = new HashMap<>();
		
		LocalDate now = LocalDate.now();
		String today = String.valueOf(now);
		

		try {
            
            for(Map<String, Object> work : workList) {
            	
            	String empId = String.valueOf(work.get("empId"));
            	String workDate = String.valueOf(work.get("workDate"));
            	String workStart = String.valueOf(work.get("workStart"));
            	String workEnd = String.valueOf(work.get("workEnd"));
            	String cmtDate = String.valueOf(work.get("cmtDate"));
            	String cmtStart = String.valueOf(work.get("cmtStart"));
            	String cmtEnd = String.valueOf(work.get("cmtEnd"));
            	String empNo = String.valueOf(work.get("empNo"));
            	String empDept = String.valueOf(work.get("empDept"));
            	
            	if(workDate.equals(today)) {
            		if(cmtDate == null) { // 출근일이 없으면
            			if(cmtStart == null) {
            				cmtData.put("result", "strNull");
            				cmtData.put("empDept", empDept);
            				cmtData.put("cmtStart", parseTime(workStart));
            				cmtData.put("sttsCd", "CMTN001");
            				cmtData.put("empNo", empNo);
            				cmtData.put("empId", empId);
            				
            			} else {
            				cmtData.put("result", "strNn");
            			}
            			
            		} else { // 출근일이 있으면
            			if(cmtEnd == null) {
            				cmtData.put("result", "endNull");
            				cmtData.put("cmtEnd", parseTime(workEnd));
            				
            			} else {
            				cmtData.put("result", "endNn");
            			}
            		}
            	}
            }
            
		} catch (ParseException e) {
			e.printStackTrace();
		}
		
		return cmtData;
	}
	
	private Timestamp parseTime(String timeStr) throws ParseException {
		SimpleDateFormat formatter = new SimpleDateFormat("HH:mm"); // 시간 형식 정의
		 // 현재 날짜 가져오기
        Calendar calendar = Calendar.getInstance();
        // "09:00"을 시간 형식으로 변환
        Date time = formatter.parse(timeStr);
        
        // 변환된 시간을 현재 날짜에 설정
        calendar.set(Calendar.HOUR_OF_DAY, time.getHours());
        calendar.set(Calendar.MINUTE, time.getMinutes());
        calendar.set(Calendar.SECOND, 0);  // 초를 0으로 설정
        calendar.set(Calendar.MILLISECOND, 0);  // 밀리초를 0으로 설정

        // 최종적으로 현재 날짜와 결합된 시간 출력
        Date currentDateWithTime = calendar.getTime();
        System.out.println("현재 날짜와 시간: " + currentDateWithTime);
        
        // Timestamp로 변환
        Timestamp timestamp = new Timestamp(currentDateWithTime.getTime());
        System.out.println("Timestamp 형태: " + timestamp);
        
		return timestamp;
	}

	public int insertCmt(Map<String, Object> searchMap) {
		searchMap.put("sttsCd", "CMTN001");
		int result = mapper.insertCmt(searchMap);
		return result;
	}

}
