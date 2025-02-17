package com.deepen.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "SALE")
@Data
public class Sale {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sale_no", nullable = false)
	private Integer sale_no;
	
	@Column(name = "order_id", length = 30, nullable = false)
	private String order_id;
	
	@Column(name = "product_no", nullable = false)
	private Integer product_no;
	
	@Column(name = "sale_deadline", nullable = false)
	private LocalDate sale_deadline;
	
	@Column(name = "sale_unit", length = 30, nullable = false)
	private String sale_unit;
	
	@Column(name = "sale_vol", nullable = false)
	private Integer sale_vol;
	
	@Column(name = "sale_status", length = 30)
	private String sale_status;
	
	
	
}
