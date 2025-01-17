package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SalaryFormulaDTO {
	private Long formulaId;
    private String formulaName;
    private String formulaType;
    private String formulaContent;
    private LocalDateTime updatedAt;
    private int applyYear;
    private int formulaPriority;
    private String formulaCode;
    private String formulaComment;
}
