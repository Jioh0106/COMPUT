package com.deepen.entity;

import java.sql.Date;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ASSIGNMENT")
@Data
public class Assignment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "assignment_no", nullable = false, unique = true)
	private Integer assignment_no; //발령번호 PK
	
	@Column(name = "assign_emp_id", length = 30, nullable = false)
	private String assign_emp_id; //발령자사원번호
	
	@Column(name = "assign_date", nullable = false)
	private Date assign_date; //발령일자
	
	@Column(name = "assign_type", length = 10, nullable = false)
	private String assign_type; //발령구분(승진/전보)
	
	@Column(name = "prev_pos", length = 50)
	private String prev_pos; //이전직급
	
	@Column(name = "new_pos", length = 50, nullable = false)
	private String new_pos; //발령직급
	
	@Column(name = "prev_dept", length = 50)
	private String prev_dept; //이전부서
	
	@Column(name = "new_dept", length = 50, nullable = false)
	private String new_dept; //발령부서
	
	@Column(name = "registr_date")
	private LocalDateTime registr_date; //최종승인일자
	
	
	@Column(name = "request_no", nullable = false)
	private Integer request_no; //요청번호 FK
	
	
	
	
	
	
	
	
}
