package com.deepen.domain;

import lombok.Data;

@Data
public class ProcessStatsDTO {
    private Integer processNo;          // 공정 번호
    private String processName;         // 공정 이름
    private long totalCount;            // 해당 공정 검사 건수
    private long passCount;             // 해당 공정 합격 건수
    private double passRate;            // 해당 공정 합격률
    private long failCount;             // 해당 공정 불합격 건수
    private double failRate;            // 해당 공정 불합격률
}