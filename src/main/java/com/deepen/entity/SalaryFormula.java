package com.deepen.entity;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.deepen.domain.PayrollDTO;
import com.deepen.domain.SalaryFormulaDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "SALARY_FORMULA")
@Data
public class SalaryFormula {
	
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "formula_seq")
	@SequenceGenerator(name = "formula_seq", sequenceName = "FORMULA_SEQ", allocationSize = 1)
	@Column(name = "formula_id")
    private int formula_id;

	@Column(name = "formula_name")
    private String formula_name;
	
	@Column(name = "formula_type")
    private String formula_type;

	@Column(name = "formula_content")
    private String formula_content;
	
	@Column(name = "apply_year")
    private int apply_year;
	
	@Column(name = "formula_priority")
    private int formula_priority;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "common_detail_no")
    private CommonDetail commonDetail;
    
    public static SalaryFormula setSalaryFormulaEntity(SalaryFormulaDTO salaryformulaDTO) {
    	SalaryFormula salaryFormula = new SalaryFormula();
    	salaryFormula.setFormula_id(salaryformulaDTO.getFormula_id());
    	salaryFormula.setFormula_name(salaryformulaDTO.getFormula_name());
    	salaryFormula.setFormula_type(salaryformulaDTO.getFormula_type());
    	salaryFormula.setFormula_content(salaryformulaDTO.getFormula_content());
    	salaryFormula.setApply_year(salaryformulaDTO.getApply_year());
    	salaryFormula.setFormula_priority(salaryformulaDTO.getFormula_priority());
    	salaryFormula.setUpdated_at(salaryformulaDTO.getUpdated_at());
		return salaryFormula;
    }
	
}
