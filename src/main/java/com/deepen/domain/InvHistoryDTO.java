package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InvHistoryDTO {
	
	private Integer history_no; //이력번호
	private Integer inventory_no; //재고번호 FK값
	private Integer prev_count; //변경 전 실재고량
	private Integer new_count; //변경 후 실재고량
	private String unit; //단위
	private String change_reason; //변경사유
	private String reason_detai; //기타사유
	private String mod_user; //수정자
	private LocalDateTime mod_date;//수정일
	
	
}
