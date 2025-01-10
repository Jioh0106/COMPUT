package com.deepen.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.deepen.domain.RequestDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "REQUEST")
@Data

public class Request {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "request_no", nullable = false)
	private Integer request_no; //요청번호
	
	@Column(name = "request_type", nullable = false)
	private String request_type; //요청유형
	
	@Column(name = "request_status", nullable = false)
	private String request_status; //요청상태
	
	@Column(name = "request_rejection", length = 200)
	private String request_rejection; //반려사유
	
	@Column(name = "request_deadline", nullable = false)
	private LocalDateTime request_deadline; //요청마감일자
	
	@Column(name = "request_date", nullable = false)
	private LocalDateTime request_date; //요청일자
	
	@Column(name = "middle_approval", nullable = false, length = 200)
	private String middle_approval; //중간승인권자 사번
	
	@Column(name = "high_approval", length = 200)
	private String high_approval; //최종승인권자 사번
	
	@Column(name = "emp_id", nullable = false, length = 30)
	private String emp_id; //요청자사번
	
	@Column(name = "complete", length = 10)
	private String complete; //처리상태
	
	@PrePersist // 엔티티에 디비에 insert 하기 전에 호출되는 어노테이션
	public void prepersist() { //요청일자는 오늘로설정, 요청마감일은 오늘로부터 +5일
		this.request_date = LocalDateTime.now();
		this.request_deadline = request_date.plusDays(5).truncatedTo(ChronoUnit.DAYS);
	}
	
	public static Request requestDTOToEntity(RequestDTO requestDTO) {
		Request request = new Request();
		request.setRequest_no(requestDTO.getRequest_no());
		request.setRequest_type(requestDTO.getRequest_type());
		request.setRequest_status(requestDTO.getRequest_status());
		request.setRequest_rejection(requestDTO.getRequest_rejection());
		request.setRequest_deadline(requestDTO.getRequest_deadline());
		request.setRequest_date(requestDTO.getRequest_date());
		request.setMiddle_approval(requestDTO.getMiddle_approval());
		request.setHigh_approval(requestDTO.getHigh_approval());
		request.setEmp_id(requestDTO.getEmp_id());
		request.setComplete(requestDTO.getComplete());
		
		return request;
	}
	
	
	
	
	
	
	
}
