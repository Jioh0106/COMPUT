package com.deepen.entity;

import java.sql.Date;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

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
	
	@Column(name = "mtr_name", length = 50, nullable = false)
	private String mtr_name;
	
	@Column(name = "mtr_type", length = 50, nullable = false)
	private String mtr_type;
	
	@Column(name = "composition", length = 50, nullable = false)
	private String composition;
	
	@Column(name = "hardness", length = 50)
	private String hardness;
	
	@Column(name = "density")
	private Integer density;
	
	@Column(name = "melting_point")
	private Integer melting_point;
	
	@Column(name = "tensile_strength")
	private Integer tensile_strength;
	
	@Column(name = "mtr_use", length = 50, nullable = false)
	private String mtr_use;
	
	@Column(name = "mtr_unit")
	private String mtr_unit;
	
	@Column(name = "mtr_reg_data", nullable = false)
	private Date mtr_reg_data;
	
	@Column(name = "mtr_mod_data")
	private Date mtr_mod_data;
	
	@Column(name = "mtr_status", length = 1,  nullable = false)
	private String mtr_status; // default ='Y' 
	
	

	
}
