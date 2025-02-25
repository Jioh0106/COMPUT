package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LotQcDTO {
    private Integer qcLogNo;           // 품질검사 이력 번호
    private String lotNo;           // LOT 번호
    private Integer processNo;       // 공정 번호
    private String qcCode;          // 품질검사 코드
    private String qcName;          // 품질검사명
    private BigDecimal measureValue;    // 측정값
    private String judgement;       // 판정
    private String inspector;       // 검사자
    private LocalDateTime checkTime;         // 검사 시간
}
