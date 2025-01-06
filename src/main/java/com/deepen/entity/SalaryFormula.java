package com.deepen.entity;

import java.time.LocalDateTime;

import com.deepen.domain.SalaryFormulaDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SalaryFormula {
	
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "formula_seq")
	@SequenceGenerator(name = "formula_seq", sequenceName = "FORMULA_SEQ", allocationSize = 1)
	@Column(name = "formula_id")
    private Long formulaId;

	@Column(name = "formula_name", nullable = false, length = 100)
    private String formulaName;
	
	@Column(name = "formula_type", nullable = false, length = 20)
    private String formulaType;

	@Column(name = "formula_content", nullable = false, length = 1000)
    private String formulaContent;
	
	@Column(name = "apply_year", nullable = false)
    private int applyYear;
	
	@Column(name = "formula_priority", nullable = false)
    private int formulaPriority;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // FK 연결 : commonDetail
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formula_code", referencedColumnName = "common_detail_code", nullable = false)
    private CommonDetail commonDetail; // FK 참조
    
    public static SalaryFormula setSalaryFormulaEntity(SalaryFormulaDTO salaryformulaDTO) {
    	SalaryFormula salaryFormula = new SalaryFormula();
    	salaryFormula.setFormulaId(salaryformulaDTO.getFormulaId());
    	salaryFormula.setFormulaName(salaryformulaDTO.getFormulaName());
    	salaryFormula.setFormulaType(salaryformulaDTO.getFormulaType());
    	salaryFormula.setFormulaContent(salaryformulaDTO.getFormulaContent());
    	salaryFormula.setApplyYear(salaryformulaDTO.getApplyYear());
    	salaryFormula.setFormulaPriority(salaryformulaDTO.getFormulaPriority());
    	// CommonDetail 설정
        CommonDetail commonDetail = new CommonDetail();
        commonDetail.setCommon_detail_code(salaryformulaDTO.getFormulaCode());
        salaryFormula.setCommonDetail(commonDetail);
    	salaryFormula.setUpdatedAt(LocalDateTime.now());
		return salaryFormula;
    }
	
}
