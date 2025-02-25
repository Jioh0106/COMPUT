package com.deepen.domain;

import lombok.Data;

@Data
public class InspectionSearchDTO {
    private String lotNo;               // LOT 번호
    private String fromDate;            // 검색 시작일
    private String toDate;              // 검색 종료일
    private Integer processNo;          // 공정 번호
    private String judgement;           // 판정 결과
}