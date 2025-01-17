package com.deepen.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ScheduleDTO {
	
	private String id;
	private String calendarId;
	private String title;
	private LocalDateTime start;
	private LocalDateTime end;
	private boolean isAllday;
	
	public static ScheduleDTO workToSchd(WorkDTO work, String id) {
		String startTime = work.getWork_start(); // "HH:mm" 형식
		String endTime = work.getWork_end();   // "HH:mm" 형식
		LocalDate workDate = work.getWork_date(); // LocalDate 타입
		
		// workDate와 "HH:mm" 형식을 합쳐서 LocalDateTime으로 변환
		LocalDateTime startDateTime = workDate
		        .atTime(Integer.parseInt(startTime.split(":")[0]),
		Integer.parseInt(startTime.split(":")[1]));
		
		LocalDateTime endDateTime = workDate
		        .atTime(Integer.parseInt(endTime.split(":")[0]),
		Integer.parseInt(endTime.split(":")[1]));

	    
		ScheduleDTO schd = new ScheduleDTO();
		schd.setId(id);
		schd.setTitle(work.getWork_tmp_name());
		schd.setStart(startDateTime);
		schd.setEnd(endDateTime);
		schd.setAllday(false);
		
		return schd;
	}
	
	

}
