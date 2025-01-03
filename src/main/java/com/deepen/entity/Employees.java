package com.deepen.entity;

import java.sql.Date;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "EMPLOYEES")
@Data
public class Employees {
	
	@Id
	@Column(name ="emp_id", length = 30)
	private String emp_id;
	
	@Column(name = "emp_no", nullable = false, unique = true)
	private int emp_no; // 구분용 pk
	
	// 사원정보
	@Column(name ="emp_role", length = 10, nullable = false)
	private String emp_role;
	
	
	@Column(name ="emp_pw", length = 30, nullable = false)
	private String emp_pw;
	
	@Column(name ="emp_name", length = 30, nullable = false)
	private String emp_name;
	
	@Column(name ="emp_photo", length = 100)
	private String emp_photo;
	
	@Column(name ="emp_ssn", length = 20, nullable = false, unique = true)
	private String emp_ssn;
	
	@Column(name ="emp_gender", length = 10, nullable = false)
	private String emp_gender;
	
	@Column(name ="emp_marital_status", length = 10, nullable = false)
	private String emp_marital_status;
	
	@Column(name ="emp_phone", length = 20, nullable = false)
	private String emp_phone;
	
	@Column(name ="emp_address", length = 255, nullable = false)
	private String emp_address;
	
	@Column(name ="emp_address_detail", length = 255)
	private String emp_address_detail;
	
	@Column(name ="emp_email", length = 50, nullable = false)
	private String emp_email;
	
	@Column(name ="emp_edu", length = 10, nullable = false)
	private String emp_edu;
	//
	
	// 인사정보
	@Column(name ="emp_status", length = 10, nullable = false)
	private String emp_status;
	
	@Column(name ="emp_job_type", length = 10, nullable = false)
	private String emp_job_type;
	
	@Column(name ="emp_dept", length = 10)
	private String emp_dept;
	
	@Column(name ="emp_position", length = 10)
	private String emp_position;
	
	@Column(name ="emp_hire_date", nullable = false)
	private Date emp_hire_date;
	
	@Column(name ="emp_perf_rank", length = 1)
	private String emp_perf_rank;
	
	@Column(name ="emp_exit_date")
	private Date emp_exit_date;
	
	@Column(name ="emp_exit_type", length = 100)
	private String emp_exit_type;
	
	@Column(name ="emp_salary")
	private int emp_salary;
	
	@Column(name ="emp_bank", length = 20)
	private String emp_bank;
	
	@Column(name ="emp_account", length = 30)
	private String emp_account;
	//
	
	@Column(name ="emp_reg_date")
	private Timestamp emp_reg_date; //정보등록일
	
	@Column(name ="emp_mod_date")
	private Timestamp emp_mod_date; //정보최종수정일

}
