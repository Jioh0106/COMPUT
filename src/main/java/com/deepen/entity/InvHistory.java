package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "INVENTORY_HISTORY")
@Entity
@Data
public class InvHistory {

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "history_no", nullable = false, unique = true)
	private Integer history_no; //이력번호 PK
	
	@Column(name = "inventory_no")
	private Integer inventory_no; //재고번호 FK값
	
	@Column(name = "prev_count")
	private Integer prev_count; //변경 전 실재고량
	
	@Column(name ="new_count" )
	private Integer new_count; //변경 후 실재고량
	
	@Column(name ="change_reason" )
	private String change_reason; //변경사유
	
	@Column(name ="reason_detai" )
	private String reason_detai; //기타사유
	
	@Column(name ="mod_user" )
	private String mod_user; //수정자
	
	@Column(name ="mod_date" )
	private LocalDateTime mod_date;//수정일
	
	
}
