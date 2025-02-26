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
		
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		
		// 현재 시간을 HH:MM 형태로 포맷
		String timeFormat = timestamp.getHours() + ":" +  timestamp.getMinutes();
		
		try {
            
            for(Map<String, Object> work : workList) {
            	
            	String empId = String.valueOf(work.get("empId"));
            	String workDate = String.valueOf(work.get("workDate"));
            	String workStart = String.valueOf(work.get("workStart"));
            	String workEnd = String.valueOf(work.get("workEnd"));
            	String cmtCd = String.valueOf(work.get("cmtCd"));
            	String cmtDate = String.valueOf(work.get("cmtDate"));
            	String cmtStart = String.valueOf(work.get("cmtStart"));
            	String cmtEnd = String.valueOf(work.get("cmtEnd"));
            	String empNo = String.valueOf(work.get("empNo"));
            	String empDept = String.valueOf(work.get("empDept"));
            	
            	
            	if(workDate.equals(today)) { // 근무일자가 오늘 날짜와 같으며
            		if(nullCheck(cmtDate)) { // 출근일이 없고
            			if(nullCheck(cmtStart)) { // 찍힌 출근 시간이 없고
            				if(timestamp.equals(parseTime(workStart)) 
            						|| timestamp.before(parseTime(workStart))) { // 현재 일시가 출근 시간이랑 같거나 이전일 경우
	            				cmtData.put("result", "start"); 
	            				cmtData.put("empDept", empDept);
	            				cmtData.put("cmtCd", cmtCd);
	            				cmtData.put("cmtStart", workStart);
	            				cmtData.put("sttsCd", "CMTN001");
	            				cmtData.put("empNo", empNo);
	            				cmtData.put("empId", empId);
	            				
            				} else { // 이후일 경우
            					cmtData.put("result", "start"); 
	            				cmtData.put("empDept", empDept);
	            				cmtData.put("cmtCd", cmtCd);
	            				cmtData.put("cmtStart", timeFormat);
	            				cmtData.put("sttsCd", "CMTN002");
	            				cmtData.put("empNo", empNo);
	            				cmtData.put("empId", empId);
            				}
            				
            			} else {
            				cmtData.put("result", "startDs");
            			}
            			
            		} else { // 출근일이 있고
            			if(nullCheck(cmtEnd)) { // 찍힌 퇴근 시간이 없고
            				if(timestamp.equals(parseTime(workEnd)) 
            						|| timestamp.after(parseTime(workEnd))) { // 현재 일시가 퇴근 시간이랑 같거나 이후일 경우
	            				cmtData.put("result", "end"); 
	            				cmtData.put("cmtCd", cmtCd);
	            				cmtData.put("cmtEnd", workEnd);
            				} else {
            					cmtData.put("result", "end"); 
            					cmtData.put("cmtCd", cmtCd);
	            				cmtData.put("cmtEnd", timeFormat);
            				}
            				
            			} else {
            				cmtData.put("result", "endDs");
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
        
        // Timestamp로 변환
        Timestamp timestamp = new Timestamp(currentDateWithTime.getTime());
        
		return timestamp;
	}

	public int insertCmt(Map<String, Object> searchMap) throws ParseException {
		
		int result = 0;
		
		String cmtTime = String.valueOf(parseTime(String.valueOf(searchMap.get("cmtTime"))));
		
		searchMap.put("cmtTime", cmtTime);

		if(nullCheck(String.valueOf(searchMap.get("cmtCd")))) {
			result = mapper.insertCmt(searchMap);
		} else {
			result = mapper.updateCmt(searchMap);
		}
		
		return result;
	}
	
	private boolean nullCheck(String str) {
		
		if(str.equals(null) || str.isEmpty() || str.equals("null") 
				|| str == null || str == "null") {
			return true;
		}
		
		return false;
	}

}
