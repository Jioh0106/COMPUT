package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class InspectionHistoryDTO {
    private Integer qcLogNo;            // 검사 이력 번호
    private String lotNo;               // LOT 번호
    private Integer processNo;          // 공정 번호
    private String processName;         // 공정 이름
    private String qcCode;              // 검사 코드
    private String qcName;              // 검사 이름
    private BigDecimal targetValue;     // 목표값
    private BigDecimal ucl;             // 상한값
    private BigDecimal lcl;             // 하한값
    private BigDecimal measureValue;    // 측정값
    private String judgement;           // 판정결과 (Y/N)
    private String inspector;           // 검사자
    private LocalDateTime checkTime;    // 검사시간
}