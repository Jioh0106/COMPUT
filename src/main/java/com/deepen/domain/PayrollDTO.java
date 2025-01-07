package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PayrollDTO {
	private int payroll_no;
	private int emp_no;
	private String allow_cd;
	private int allow_amt;
	private LocalDateTime payment_date;
	private String deduc_cd;
	private int deduc_amt;

}
