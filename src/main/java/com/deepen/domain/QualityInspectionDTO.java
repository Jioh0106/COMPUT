package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QualityInspectionDTO {
	private Integer qcLogNo;
	private String lotNo;
    private Integer processNo;
    private String qcCode;
    private String qcName;
    private BigDecimal targetValue;
    private BigDecimal ucl;
    private BigDecimal lcl;
    private BigDecimal measureValue;
    private String judgement;
    private String inspector;
    private LocalDateTime checkTime;
    private LocalDateTime endTime;
}
