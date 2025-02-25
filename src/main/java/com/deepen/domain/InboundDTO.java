package com.deepen.domain;

import java.time.LocalDate;

import lombok.Data;

@Data
public class InboundDTO {
	
	private int in_no; 					// 입고번호
	private int item_no;                // 품목번호
    private int inventory_no; 			// 재고번호
    private LocalDate in_date; 			// 입고일자
    private int in_qty; 				// 입고수량
    private String warehouse_id; 		// 창고 ID
    private String warehouse_name; 		// 창고명
    private String zone; 				// 구역(창고)
    private String status; 				// 상태
    private String reg_user; 			// 등록자
    private LocalDate reg_date; 		// 등록일
    private String mod_user; 			// 수정자
    private LocalDate mod_date; 		// 수정일
    
    // 품목관련
    private String item_code;			// 품목코드 (자재번호 또는 상품번호)
    private String item_type;			// 품목구분 (자재 또는 완제품)
    private String item_name;			// 품목명(재고명 또는 상품명)
    private String item_unit;			// 품목단위(자재 또는 완제픔)
    private String source;				// 출처(QC/PO/MANUAL)
    
}