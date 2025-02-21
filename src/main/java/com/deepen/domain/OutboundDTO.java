package com.deepen.domain;

import java.time.LocalDate;

import lombok.Data;

@Data
public class OutboundDTO {
	
	private int out_no; 			// 출고번호
	private int item_no;            // 품목번호
    private int inventory_no; 		// 재고번호
    private LocalDate out_date;		// 출고일
    private int out_qty; 			// 출고수량
    private int inventory_qty;  	// 재고수량
    private String wi_no;			// 작업지시번호
    private String warehouse_id; 	// 창고 ID
    private String warehouse_name; 	// 창고명
    private String zone; 			// 구역(창고)
    private String status; 			// 상태
    private String reg_user;		// 승인자
    private LocalDate reg_date; 	// 승인일
    
    // 품목관련
    private String item_code;		// 품목코드 (자재번호 또는 상품번호)
    private String item_type;		// 품목구분 (자재 또는 완제품)
    private String item_name;		// 품목명(재고명 또는 상품명)
    private String item_unit;		// 품목단위(자재 또는 완제픔)
    
    private String source;			// 출처(자재투입 또는 제품출고)
}