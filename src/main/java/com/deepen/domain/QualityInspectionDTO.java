package com.deepen.domain;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class QualityInspectionDTO {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LotInspectionDTO {
        private String lotNo;          // LOT 번호
        private String wiNo;           // 작업지시 번호
        private Long productNo;        // 제품 번호
        private String productName;    // 제품명
        private Long processNo;        // 공정 번호
        private String processName;    // 공정명
        private String lotStatus;      // LOT 상태(LTST)
        private LocalDateTime createTime;  // 생성시간
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QcItemDTO {
        private String qcCode;         // 검사 코드
        private String qcName;         // 검사명
        private Double targetValue;    // 목표값
        private Double ucl;            // 상한값
        private Double lcl;            // 하한값
        private String unit;           // 단위
        private Double measureValue;   // 측정값
        private String judgment;       // 판정(Y/N)
        private String inspector;      // 검사자
        private LocalDateTime checkTime; // 검사시간
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InspectionResultDTO {
        private String lotNo;          // LOT 번호
        private String qcCode;         // 검사 코드
        private Double measureValue;   // 측정값
        private String judgment;       // 판정
        private String inspector;      // 검사자
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LotInspectionResultDTO {
        private String lotNo;          // LOT 번호
        private List<QcItemDTO> qcItems;  // 검사항목 리스트
        private String finalJudgment;     // 최종판정
        private String inspector;          // 검사자
        private LocalDateTime inspectionTime; // 검사시간
    }
}