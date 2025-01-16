package com.deepen.domain;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class WorkDTO {
	
	private Integer work_no;
	private String emp_id;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate work_date;
	private String work_tmp_name;
	
	// ===============================
	
	private String emp_name;
	private String emp_dept;
	private String work_start;
	private String work_end;
	private String work_shift;
	private String work_type;
	private Integer work_time;
	private Integer rest_time;

}
