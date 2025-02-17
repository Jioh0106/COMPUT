package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LotMasterDTO {
    private String lotNo;
    private String parentLotNo;
    private String processType;
    private String wiNo;
    private Integer productNo;
    private Integer processNo;
    private String productName;
    private String processName;
    private Integer lineNo;
    private String lotStatus;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}