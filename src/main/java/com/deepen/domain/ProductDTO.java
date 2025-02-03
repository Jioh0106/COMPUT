package com.deepen.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ProductDTO {
	
	private Integer product_no; //상품번호
	private String product_name; //상품명 
	private String product_unit; //단위 
	private Integer product_price; //가격
	@DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
	private LocalDate product_date; //등록일
	private String product_type; // 상품유형(반제품/완제품)
}
