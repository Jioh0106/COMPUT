package com.deepen.entity;

import java.math.BigDecimal;
import java.sql.Date;

import com.deepen.domain.MaterialDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
	private BigDecimal density;
	
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
	
	
	public static Material setMaterialToEntity(MaterialDTO materialDTO) {
		
		Material matetial = new Material();
		matetial.setMtr_no(materialDTO.getMtr_no());
		matetial.setMtr_name(materialDTO.getMtr_name());
		matetial.setMtr_type(materialDTO.getMtr_type());
		matetial.setComposition(materialDTO.getComposition());
		matetial.setHardness(materialDTO.getHardness());
		matetial.setDensity(materialDTO.getDensity());
		matetial.setMelting_point(materialDTO.getMelting_point());
		matetial.setTensile_strength(materialDTO.getTensile_strength());
		matetial.setMtr_use(materialDTO.getMtr_use());
		matetial.setMtr_unit(materialDTO.getMtr_unit());
		matetial.setMtr_reg_data(materialDTO.getMtr_reg_data());
		matetial.setMtr_mod_data(materialDTO.getMtr_mod_data());
		matetial.setMtr_status(materialDTO.getMtr_status());
		
		return matetial;
		
		
	}
	
}
