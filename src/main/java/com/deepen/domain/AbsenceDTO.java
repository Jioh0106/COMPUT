package com.deepen.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class AbsenceDTO {
	
	private Integer absence_no;
	private String emp_id;
	private String absence_type;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate absence_start;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate absence_end;
	
	private Integer request_no;
	private String absence_remark;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime update_date;
	private String update_emp_id;
	

}
