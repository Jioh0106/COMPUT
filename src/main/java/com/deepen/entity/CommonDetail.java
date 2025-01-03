package com.deepen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "COMMON_DETAIL")
@Data
public class CommonDetail {
	
	@Id
	@Column(name="common_detail_code", length = 10, nullable = false)
	private String common_detail_code;
	
	@Column(name="common_detail_name", length = 50, nullable = false)
	private String common_detail_name;
	
	@Column(name="common_detail_status", length = 1)
	private String common_detail_status;
	
	@Column(name="common_detail_display")
	private int common_detail_display;


}
