package com.deepen.domain;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class InventoryDTO {
	
	private Integer inventory_no;//재고번호
	private String inventory_type;//재고구분
	private Integer item_no; //품목번호(자재번호, 상품번호)
	private String item_name; //품목명
	private String warehouse_id; //창고id
	private String zone; //구역
	private Integer inventory_qty; //재고량
	private Integer inventory_count;//실재고량
	private String mod_user; //수정자
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime mod_date;//수정일
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime inventory_change_date; //재고량변경일
	private String unit; //단위
	
}
