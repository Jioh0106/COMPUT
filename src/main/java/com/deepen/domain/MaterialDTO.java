package com.deepen.domain;

import java.math.BigDecimal;
import java.sql.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;
@Data
public class MaterialDTO {
	
	private Integer mtr_no;
	private String mtr_name;
	private String mtr_type;
	private String composition;
	private String hardness;
	private BigDecimal density;
	private Integer melting_point;
	private Integer tensile_strength;
	private String mtr_use;
	private String mtr_unit;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date mtr_reg_data;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date mtr_mod_data;
	private String mtr_status;
	
	// ------------------------------
	private String unit_name;
	
}
