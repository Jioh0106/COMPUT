package com.deepen.domain;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class RequestDTO {
	
	private Integer request_no; //요청번호
	private String request_division; //요청구분
	private String request_type; //요청유형
	private String request_status; //요청상태
	private String request_rejection; //반려사유
	
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime request_deadline; //요청마감일자
    
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime request_date; //요청일자
    
	private String middle_approval; //중간승인권자 사번
	private String high_approval; //최종승인권자 사번
	private String emp_id; //요청자사번
	private String complete; //처리상태 (N/Y)
	
	
	private  EmployeesDTO approver; //중간승인권자 정보 저장
	
	
	
	
}
