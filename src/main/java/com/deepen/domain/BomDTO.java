package com.deepen.domain;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class BomDTO {
	
	private Integer bom_no; //BOM번호
	private Integer product_no; // 목적상품
	private Integer mtr_no; //원자재
	private Integer mtrproduct_no; //자재상품
	private String bom_unit; //단위
	private Integer bom_quantity; //소모량
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime bom_date; //등록일
	private String bom_status; //상태
	private String process_name; //공정
	
	
	//BOM자재 선택 값
	private Integer itemNo;
	private String itemType;
	private String itemUnit;
	private Integer productNo;
	
	//하위그리드 조인해서 가져올때 자재,상품명
	private String mtr_name;
	private String product_name;
	
}
