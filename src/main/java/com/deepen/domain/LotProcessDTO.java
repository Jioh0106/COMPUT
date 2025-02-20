package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LotProcessDTO {
    private Integer processLogNo;      // 공정 이력 번호
    private String lotNo;           // LOT 번호
    private Integer wiNo;            // 작업지시 번호
    private Integer processNo;       // 공정 번호
    private String processName;     // 공정명
    private Integer lineNo;          // 라인 번호
    private String actionType;      // 작업 구분
    private Integer inputQty;       // 투입 수량
    private Integer outputQty;      // 산출 수량
    private String createUser;      // 생성자
    private LocalDateTime createTime;        // 생성 시간
}