package com.deepen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "CLIENT")
@Data
public class Client {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "client_no", nullable = false)
	private Integer client_no;
	
	@Column(name = "client_name", length = 200, nullable = false)
	private String client_name;
	
	@Column(name = "client_tel", length = 30)
	private String client_tel;
	
	@Column(name = "client_boss", length = 30)
	private String client_boss;
	
	@Column(name = "client_emp", length = 30)
	private String client_emp;
	
	@Column(name = "client_postcode")
	private Integer client_postcode;
	
	@Column(name = "client_adrress", length = 200)
	private String client_adrress;
	
	@Column(name = "client_type", length = 30)
	private String client_type;
	
	@Column(name = "client_memo", length = 300)
	private String client_memo;
	
	
}
