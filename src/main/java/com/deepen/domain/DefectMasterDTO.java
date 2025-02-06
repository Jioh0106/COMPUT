package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DefectMasterDTO {
    private String defectCode;
    private String defectName;
    private Integer process;
    private String defectType;
    private String defectLevel;
    private String judgmentCriteria;
    private String useYn;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}