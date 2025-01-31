package com.deepen.domain;

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
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime product_date; //등록일
}
