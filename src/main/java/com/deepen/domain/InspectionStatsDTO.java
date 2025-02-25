package com.deepen.domain;

import java.util.List;

import lombok.Data;

@Data
public class InspectionStatsDTO {
    private long totalCount;            // 전체 검사 건수
    private long passCount;             // 합격 건수
    private double passRate;            // 합격률
    private long failCount;             // 불합격 건수
    private double failRate;            // 불합격률
    private List<ProcessStatsDTO> processStats;  // 공정별 통계
}