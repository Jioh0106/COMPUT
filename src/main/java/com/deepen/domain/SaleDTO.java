package com.deepen.domain;

import java.sql.Date;
import java.sql.Timestamp;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class SaleDTO {
	
	private Integer sale_no;
	private String order_id;
	private Integer product_no;
	private String sale_unit;
	private Integer sale_vol;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private Date sale_deadline;
	
	private String sale_status;
	
	// ==============================
	
	private String product_name;
	private String unit_name;
	private String order_type;
	private String order_emp;
	private String emp_name;
	private String client_name;
	private Integer time_sum;
	private String plan_status;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp order_date;
}
