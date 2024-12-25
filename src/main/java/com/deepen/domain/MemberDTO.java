package com.deepen.domain;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class MemberDTO {
	private String id;
	private String pass;
	private String name;
	private Timestamp reg_date;
	
	private String role;

}
