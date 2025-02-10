package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class QualityCheckDTO {
    private Long qcLogNo;            // 품질검사 로그 번호
    private String lotNo;            // LOT 번호
    private Long processNo;          // 공정번호
    private String qcCode;           // 품질검사 코드
    private Double measureValue;     // 측정값
    private String judgement;        // 판정
    private String inspector;        // 검사자
    private LocalDateTime checkTime; // 검사시간
    private String lotStatus;        // LOT 상태
    private String note;             // 비고
    private LocalDateTime createTime;// 생성시간
    
    // QC 기준 정보
    private String qcName;           // 검사항목명
    private Double targetValue;      // 목표값
    private Double ucl;              // 상한값
    private Double lcl;              // 하한값
    private String qcMethod;         // 검사방법
    private String unit;             // 단위
    
    // 공정 정보
    private String processName;      // 공정명
    private Long lineNo;            // 라인번호
    
    // 추가 정보
    private Integer planQty;         // 계획수량
    private Integer currQty;         // 현재수량
}