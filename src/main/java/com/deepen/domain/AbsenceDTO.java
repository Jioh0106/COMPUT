package com.deepen.domain;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;
import oracle.sql.DATE;

@Data
public class AbsenceDTO {
	
	private Integer absence_no;
	private String emp_id;
	private String absence_type;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate absence_start;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate absence_end;
	
	private Integer request_no;
	private String absence_remark;
	

}
