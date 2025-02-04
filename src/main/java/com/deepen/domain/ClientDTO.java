package com.deepen.domain;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class ClientDTO {
	
	private Integer client_no;
	private String client_name;
	private String client_tel;
	private String client_boss;
	private String client_emp;
	private Integer client_postcode;
	private String client_adrress;
	private String client_type;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate client_date;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate client_update;
	private String client_memo;
}
