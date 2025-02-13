package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class WorkInstructionDTO {
	private Long wiNo;           // 작업 지시 번호
    private String planId;       // 생산계획 아이디
    private Long productNo;      // 품목 번호
    private String productName;  // 품목 이름
    private Integer quantity;    // 수량
    private String wiStatus;     // 작업 상태
    private String qcStatus;     // 품질검사 상태
    private String processNo;    // 공정정보 번호들
    private Long lineNo;         // 라인 고유 번호
    private LocalDateTime wiStartDate;    // 작업 시작 시간
    private LocalDateTime wiEndDate;      // 작업 완료 시간
    private String empId;        // 작업자 담당자 ID
}
