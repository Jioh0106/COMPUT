package com.deepen.domain;

import java.sql.Timestamp;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class PlansDTO {

	private String plan_id; 
	private String order_id;
	private Integer sale_no;
	private String emp_id;
	private String plan_status;
	private String plan_priority;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp plan_date;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp plan_update;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate plan_start_date;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate plan_end_date;
	
	// -----------------------------------------------
	private String emp_name;
	private String status_name;
	
	
	
	
	
}
