package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QcMasterDTO {
    private String qcCode;
    private String qcName;
    private Integer process;
    private String unit;
    private String qcMethod;
    private String useYn;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}