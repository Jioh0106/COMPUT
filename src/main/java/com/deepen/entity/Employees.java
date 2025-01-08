package com.deepen.entity;

import java.sql.Timestamp;
import java.time.LocalDate;

import com.deepen.domain.EmployeesDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Table(name = "EMPLOYEES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employees {
	
	
	// 사원정보
	@Id
	@Column(name ="emp_id", length = 30)
	private String emp_id;
	
	@Column(name = "emp_no", nullable = false, unique = true)
	private int emp_no; // 구분용 pk
	
	@Column(name ="emp_pw", length = 30, nullable = false)
	private String emp_pw;
	
	@Column(name ="emp_role", length = 20, nullable = false)
	private String emp_role;
	
	@Column(name ="emp_name", length = 30, nullable = false)
	private String emp_name;
	
	@Column(name ="emp_photo", length = 100, nullable = true)
	private String emp_photo;
	
	@Column(name ="emp_ssn", length = 20, nullable = false, unique = true)
	private String emp_ssn;
	
	@Column(name ="emp_gender", length = 10, nullable = false)
	private String emp_gender;
	
	@Column(name ="emp_marital_status", length = 10, nullable = false)
	private String emp_marital_status;
	
	@Column(name ="emp_phone", length = 20, nullable = false)
	private String emp_phone;
	
	@Column(name = "emp_postcode", length = 20, nullable = true)
	private String emp_postcode;
	
	@Column(name ="emp_address", length = 255, nullable = false)
	private String emp_address;
	
	@Column(name ="emp_address_detail", length = 255, nullable = true)
	private String emp_address_detail;
	
	@Column(name ="emp_email", length = 50, nullable = false)
	private String emp_email;
	
	@Column(name ="emp_edu", length = 10, nullable = false)
	private String emp_edu;
	//
	
	// 인사정보
	@Column(name ="emp_status", length = 20, nullable = false)
	private String emp_status;
	
	@Column(name ="emp_job_type", length = 20, nullable = false)
	private String emp_job_type;
	
	@Column(name ="emp_dept", length = 20, nullable = true)
	private String emp_dept;
	
	@Column(name ="emp_position", length = 20, nullable = true)
	private String emp_position;
	
	@Column(name ="emp_hire_date", nullable = false)
	private LocalDate emp_hire_date;
	
	@Column(name ="emp_perf_rank", length = 20, nullable = true)
	private String emp_perf_rank;
	
	@Column(name ="emp_exit_date", nullable = true)
	private LocalDate emp_exit_date;
	
	@Column(name ="emp_exit_type", length = 100, nullable = true)
	private String emp_exit_type;
	
	@Column(name ="emp_salary", nullable = false)
	private int emp_salary;
	
	@Column(name ="emp_bank", length = 20, nullable = true)
	private String emp_bank;
	
	@Column(name ="emp_account", length = 30, nullable = true)
	private String emp_account;
	//
	
	@Column(name ="emp_reg_date", nullable = true)
	private Timestamp emp_reg_date; //정보등록일
	
	@Column(name ="emp_mod_date", nullable = true)
	private Timestamp emp_mod_date; //정보최종수정일
	
	public static Employees setEmployees(EmployeesDTO empDTO) {
	return Employees.builder()
            .emp_id(empDTO.getEmp_id())
            .emp_no(empDTO.getEmp_no())
            .emp_pw(empDTO.getEmp_pw())
            .emp_role(empDTO.getEmp_role())
            .emp_name(empDTO.getEmp_name())
            .emp_photo(empDTO.getEmp_photo())
            .emp_ssn(empDTO.getEmp_ssn())
            .emp_gender(empDTO.getEmp_gender())
            .emp_marital_status(empDTO.getEmp_marital_status())
            .emp_phone(empDTO.getEmp_phone())
            .emp_postcode(empDTO.getEmp_postcode())
            .emp_address(empDTO.getEmp_address())
            .emp_address_detail(empDTO.getEmp_address_detail())
            .emp_email(empDTO.getEmp_email())
            .emp_edu(empDTO.getEmp_edu())
            .emp_status(empDTO.getEmp_status())
            .emp_job_type(empDTO.getEmp_job_type())
            .emp_dept(empDTO.getEmp_dept())
            .emp_position(empDTO.getEmp_position())
            .emp_hire_date(empDTO.getEmp_hire_date())
            .emp_perf_rank(empDTO.getEmp_perf_rank())
            .emp_exit_date(empDTO.getEmp_exit_date())
            .emp_exit_type(empDTO.getEmp_exit_type())
            .emp_salary(empDTO.getEmp_salary())
            .emp_bank(empDTO.getEmp_bank())
            .emp_account(empDTO.getEmp_account())
            .emp_reg_date(empDTO.getEmp_reg_date())
            .emp_mod_date(empDTO.getEmp_mod_date())
            .build();
	}

}
