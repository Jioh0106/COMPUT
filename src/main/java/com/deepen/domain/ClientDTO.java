package com.deepen.domain;

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
	private String client_memo;
}
