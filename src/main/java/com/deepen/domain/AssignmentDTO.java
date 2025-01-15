package com.deepen.domain;

import java.sql.Date;
import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class AssignmentDTO {
	
	private String emp_id; 
	private String emp_name;
	
	
	private Integer assignment_no; //발령번호 PK
	private String assign_emp_id; //발령자사원번호
	private String assign_emp_name; //발령자이름
	private Date assign_date; //발령일자
	private String assign_type; //발령구분(승진/전보)
	private String prev_pos; //이전직급
	private String new_pos; //발령직급
	private String prev_dept; //이전부서
	private String new_dept; //발령부서
	@DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime registr_date; //최종승인일자
	private Integer request_no; //요청번호 FK
	
	
	
	
	
	
}
