package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name="PRODUCT")
@Entity
@Data
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "product_no", nullable = false, unique = true)
	private Integer product_no; //상품번호 PK
	
	@Column(name = "product_name", length = 30)
	private String product_name; //상품명 
	
	@Column(name = "product_unit", length = 20 )
	private String product_unit; //단위

	@Column(name = "product_date")
	private LocalDateTime product_date; //등록일
	
	@Column(name = "product_type", length = 20 )
	private String product_type; //상품유형
	
	
}
