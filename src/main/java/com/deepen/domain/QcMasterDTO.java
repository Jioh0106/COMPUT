package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QcMasterDTO {
    private String qcCode;
    private String qcName;
    private Integer processNo;
    private String processName;
    private BigDecimal targetValue;
    private BigDecimal ucl;
    private BigDecimal lcl;
    private String unitCode;
    private String unitName;
    private String qcMethod;
    private String useYn;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}