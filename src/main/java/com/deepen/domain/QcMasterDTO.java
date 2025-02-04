package com.deepen.domain;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class QcMasterDTO {
    private String qcCode;
    private String qcName;
    private Integer processNo;
    private Integer productNo;
    private BigDecimal targetValue;
    private BigDecimal ucl;
    private BigDecimal lcl;
    private String unit;
    private String qcMethod;
    private String useYn;
}
