package com.deepen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "BUY")
@Data
public class Buy {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "buy_no", nullable = false)
	private Integer buy_no;
	
	@Column(name = "order_id", length = 30, nullable = false)
	private String order_id;
	
	@Column(name = "mtr_no", nullable = false)
	private Integer mtr_no;
	
	@Column(name = "buy_unit", length = 30, nullable = false)
	private String buy_unit;
	
	@Column(name = "buy_vol", nullable = false)
	private Integer buy_vol;
	
	@Column(name = "buy_status", length = 30)
	private String buy_status;
	
	
	
}
