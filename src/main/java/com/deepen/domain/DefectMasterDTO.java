package com.deepen.domain;

import lombok.Data;

@Data
public class DefectMasterDTO {
    private String defectCode;
    private String defectName;
    private Integer processNo;
    private String defectType;
    private String defectLevel;
    private String judgmentCriteria;
    private String useYn;
}
