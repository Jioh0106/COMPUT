package com.deepen.domain;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import lombok.Data;

@Data
public class ScheduleDTO {
	
	private String id;
	private String calendarId;
	private String title;
	private String start;
	private String end;
	private boolean isAllday;
	
	public static ScheduleDTO workToSchd(WorkDTO work, String id) {
		String startTime = work.getWork_start(); // "HH:mm" 형식
		String endTime = work.getWork_end();   // "HH:mm" 형식
		LocalDate workDate = work.getWork_date(); // LocalDate 타입
	    // workDate와 "HH:mm" 형식을 합쳐서 LocalDateTime으로 변환
	    LocalDateTime startDateTime = workDate.atTime(Integer.parseInt(startTime.split(":")[0]),
	                                                  Integer.parseInt(startTime.split(":")[1]));
	    
	    LocalDateTime endDateTime = workDate.atTime(Integer.parseInt(endTime.split(":")[0]),
	                                                Integer.parseInt(endTime.split(":")[1]));

	    DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	    String formattedStartTime = startDateTime.format(formatter);
	    String formattedEndTime = endDateTime.format(formatter);

		ScheduleDTO schd = new ScheduleDTO();
		schd.setId(id);
		schd.setTitle(work.getEmp_name());
	    schd.setStart(formattedStartTime); 
	    schd.setEnd(formattedEndTime); 
		schd.setAllday(false);
		schd.setCalendarId("work");
		
		return schd;
	}

	public static ScheduleDTO vctnToSchd(Map<String, Object> map, String id) {
		ScheduleDTO schd = new ScheduleDTO();
		schd.setId(id);
		schd.setTitle((String) map.get("EMP_NAME")+" "+(String) map.get("TYPE_NAME"));
	    Timestamp startTimestamp = (Timestamp) map.get("VACATION_START");
	    Timestamp endTimestamp = (Timestamp) map.get("VACATION_END");

	    LocalDateTime startDateTime = startTimestamp.toLocalDateTime();
	    LocalDateTime endDateTime = endTimestamp.toLocalDateTime();

	    DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	    String formattedStart = startDateTime.format(formatter);
	    String formattedEnd = endDateTime.format(formatter);

	    schd.setStart(formattedStart);
	    schd.setEnd(formattedEnd);
		schd.setAllday(true);
		schd.setCalendarId("vctn");
		
		return schd;
	}
	
	

}
