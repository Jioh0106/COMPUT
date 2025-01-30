package com.deepen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Data;

@Entity
@Table(name = "MATERIAL")
@Data
public class Material {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "mtr_no", nullable = false)
	private Integer mtr_no;
	
	@Column(name = "mtr_name", length = 200, nullable = false)
	private String mtr_name;
	
	@Column(name = "ress_unit", length = 30)
	private String ress_unit;
	
	@Column(name = "use_unit", length = 30)
	private String use_unit;
	
	@Column(name = "mtr_status", length = 1)
	private String mtr_status; // default ='Y' 
	
}
