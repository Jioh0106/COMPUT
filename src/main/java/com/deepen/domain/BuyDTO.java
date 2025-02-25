package com.deepen.domain;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class BuyDTO {
	
	private Integer buy_no;
	private String order_id;
	private Integer mtr_no;
	private String buy_unit;
	private Integer buy_vol;	
	private String buy_status;
	
	// ==========================================
	
	private String mtr_name;
	private String unit_name;
	private String order_type;
	private String order_emp;
	private String emp_name;
	private String client_name;
	private String inbound_status;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp order_date;
}