package com.deepen.entity;


import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "INBOUND")
@Data
public class Inbound {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "in_no")
    private int in_no; // 입고번호

    @Column(name = "inventory_no")
    private int inventory_no; // 재고번호

    @Column(name = "in_date", nullable = false)
    private LocalDate in_date; // 입고일자

    @Column(name = "in_qty", nullable = false)
    private int in_qty; // 입고수량

    @Column(name = "warehouse_id", nullable = false, length = 20)
    private String warehouse_id; // 창고 ID

    @Column(name = "zone", length = 20)
    private String zone; // 구역
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // 상태

    @Column(name = "reg_user", length = 50)
    private String reg_user; // 승인자

    @Column(name = "reg_date")
    private LocalDate reg_date; // 승인일
    
    @Column(name = "buy_no")
    private int buy_no; // 발주번호

    @Column(name = "item_no")
    private int item_no; // 품목번호
    
}