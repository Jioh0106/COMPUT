package com.deepen.entity;

import com.deepen.domain.BuyDTO;
import com.deepen.domain.SaleDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "BUY")
@Data
public class Buy {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "buy_no", nullable = false)
	private Integer buy_no;
	
	@Column(name = "order_id", length = 30, nullable = false)
	private String order_id;
	
	@Column(name = "mtr_no", nullable = false)
	private Integer mtr_no;
	
	@Column(name = "buy_unit", length = 30, nullable = false)
	private String buy_unit;
	
	@Column(name = "buy_vol", nullable = false)
	private Integer buy_vol;
	
	@Column(name = "buy_status", length = 30)
	private String buy_status;
	
	public static Buy setBuyEntity(BuyDTO buyDTO) {
		Buy buy = new Buy();
		buy.setBuy_no(buyDTO.getBuy_no());
		buy.setOrder_id(buyDTO.getOrder_id());
		buy.setMtr_no(buyDTO.getMtr_no());
		buy.setBuy_unit(buyDTO.getBuy_unit());
		buy.setBuy_vol(buyDTO.getBuy_vol());
		buy.setBuy_status(buyDTO.getBuy_status());
		
		return buy;
	}
	
}
