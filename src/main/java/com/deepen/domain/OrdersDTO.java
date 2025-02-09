package com.deepen.domain;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class OrdersDTO {

	private String order_id;
	private String order_emp;
	private String order_type;
	private Integer client_no;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp order_date;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp order_update;
	
	// -----------------------------------------------
	
	
	private String emp_name;
	private String client_name;
	private Integer count;
	
	
	
	
	
}
