package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name="BOM")
@Entity
@Data
public class Bom {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "bom_no", nullable = false, unique = true)
	private Integer bom_no; //BOM번호
	
	@Column(name = "product_no")
	private Integer product_no; // 목적상품
	
	@Column(name = "mtr_no")
	private Integer mtr_no; //원자재
	
	@Column(name = "mtrproduct_no")
	private Integer mtrproduct_no; //자재상품
	
	@Column(name = "bom_unit")
	private String bom_unit; //단위
	
	@Column(name = "bom_quantity")
	private Integer bom_quantity; //소모량
	
	@Column(name = "bom_date")
	private LocalDateTime bom_date; //등록일
	
	@Column(name = "bom_status")
	private String bom_status; //상태
	
	@Column(name = "process_name")
	private String process_name; //공정
	
}
