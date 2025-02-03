package com.deepen.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InboundDTO {
	private int in_no; 					// 입고번호
    private int inventory_no; 			// 재고번호
    private String item_name;			// 품목명(재고명, 상품명)
    private LocalDateTime in_date; 		// 입고일자
    private int in_qty; 				// 입고수량
    private String warehouse_id; 		// 창고 ID
    private String warehouse_name; 		// 창고명
    private String zone; 				// 구역(창고)
    private String inspector; 			// 검수자
    private String inspection_result;	// 검수결과
    private String status; 				// 상태
    private String note;				// 비고
    private String reg_user; 			// 등록자
    private LocalDate reg_date; 		// 등록일
    private String mod_user; 			// 수정자
    private LocalDate mod_date; 		// 수정일
}