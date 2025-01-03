package com.deepen.domain;

import java.sql.Date;
import java.sql.Timestamp;

import lombok.Data;

@Data
public class EmployeesDTO {
	
	
	// 사원정보
	private String emp_id;
	private int emp_no; // 아이디 생성용
	private String emp_role;
	private String emp_pw;
	private String emp_name;
	private String emp_photo;
	private String emp_ssn;
	private String emp_gender;
	private String emp_marital_status;
	private String emp_phone;
	private String emp_address;
	private String emp_address_detail;
	private String emp_email;
	private String emp_edu;
	//
	
	// 인사정보
	private String emp_status;
	private String emp_job_type;
	private String emp_dept;
	private String emp_position;
	private Date emp_hire_date;
	private String emp_perf_rank;
	private Date emp_exit_date;
	private String emp_exit_type;
	private int emp_salary;
	private String emp_bank;
	private String emp_account;
	//
	
	private Timestamp emp_reg_date; //정보등록일
	private Timestamp emp_mod_date; //정보최종수정일

}
