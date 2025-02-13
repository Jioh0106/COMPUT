package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Table(name = "INVENTORY")
@Entity
@Data
public class Inventory {
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "inventory_no", nullable = false, unique = true)
	private Integer inventory_no; //재고번호
	
	@Column(name = "inventory_type")
	private String inventory_type; //재고구분
	
	@Column(name = "item_no")
	private Integer item_no; //품목번호
	
	@Column(name = "warehouse_id")
	private String warehouse_id; //창고id
	
	@Column(name = "inventory_qty")
	private Integer inventory_qty; //재고량
	
	@Column(name = "inventory_count")
	private Integer inventory_count; //실재고량
	
	@Column(name = "inventory_change_date")
	private LocalDateTime inventory_change_date; //재고량변경일
	
	
	
	
}
