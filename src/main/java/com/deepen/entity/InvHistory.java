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
	@Column(name = "HISTORY_NO", nullable = false, unique = true)
	private Integer history_no; //이력번호 PK
	
	@Column(name = "INVENTORY_NO")
	private Integer inventory_no; //재고번호 FK값
	
	@Column(name = "PREV_COUNT")
	private Integer prev_count; //변경 전 실재고량
	
	@Column(name ="NEW_COUNT" )
	private Integer new_count; //변경 후 실재고량
	
	@Column(name ="CHANGE_REASON" )
	private String change_reason; //변경사유
	
	@Column(name ="REASON_DETAIL" )
	private String reason_detail; //기타사유
	
	@Column(name ="MOD_USER" )
	private String mod_user; //수정자
	
	@Column(name ="MOD_DATE" )
	private LocalDateTime mod_date;//수정일
	
	@Column(name ="DIFF_COUNT" )
	private Integer diff_count; // 변경후실재고량 - 변경전실재고량
	
	
}
