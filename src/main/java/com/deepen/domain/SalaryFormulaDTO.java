package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SalaryFormulaDTO {
	private int formula_id;
    private String formula_name;
    private String formula_type;
    private String formula_content;
    private LocalDateTime updated_at;
    private int apply_year;
    private int formula_priority;
    private int common_detail_no;

}
