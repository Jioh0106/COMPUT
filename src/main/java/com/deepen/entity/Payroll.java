package com.deepen.entity;

import java.time.LocalDateTime;

import com.deepen.domain.PayrollDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "PAYROLL")
@Data
public class Payroll {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payroll_seq")
	@SequenceGenerator(name = "payroll_seq", sequenceName = "PAYROLL_SEQ", allocationSize = 1)
	@Column(name = "payroll_no")
	private int payroll_no;
	
	@Column(name = "emp_no")
	private int emp_no;
	
	@Column(name = "allow_cd")
	private String allow_cd;
	
	@Column(name = "allow_amt")
	private int allow_amt;
	
	@Column(name = "payment_date")
	private LocalDateTime payment_date;
	
	@Column(name = "deduc_cd")
	private String deduc_cd;
	
	@Column(name = "deduc_amt")
	private int deduc_amt;
	
	public static Payroll setPayrollEntity(PayrollDTO payrollDTO) {
		Payroll payroll = new Payroll();
		payroll.setPayroll_no(payrollDTO.getPayroll_no());
		payroll.setEmp_no(payrollDTO.getEmp_no());
		payroll.setAllow_cd(payrollDTO.getAllow_cd());
		payroll.setAllow_amt(payrollDTO.getAllow_amt());
		payroll.setPayment_date(payrollDTO.getPayment_date());
		payroll.setDeduc_cd(payrollDTO.getDeduc_cd());
		payroll.setDeduc_amt(payrollDTO.getDeduc_amt());
		return payroll;
	}
	
	

}
