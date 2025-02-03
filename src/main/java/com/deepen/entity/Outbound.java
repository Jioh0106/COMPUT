package com.deepen.entity;


import java.time.LocalDate;
import java.time.LocalDateTime;

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
public class Outbound {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "out_no", nullable = false)
    private int out_no; // 출고번호
    
    @Column(name = "inventory_no", nullable = false)
    private int inventory_no; // 재고번호
    
    @Column(name = "out_date", nullable = false)
    private LocalDate out_date; // 출고일
    
    @Column(name = "out_qty", nullable = false, precision = 10, scale = 0)
    private int out_qty; // 출고수량
    
    @Column(name = "wi_no", length = 20)
    private String wi_no; // 작업지시번호
    
    @Column(name = "warehouse_id", nullable = false, length = 20)
    private String warehouse_id; // 창고 ID
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // 상태
    
    @Column(name = "note", length = 500)
    private String note; // 비고
    
    @Column(name = "reg_user", nullable = false, length = 50)
    private String reg_user; // 등록자
    
    @Column(name = "reg_date", nullable = false)
    private LocalDate reg_date; // 등록일
    
    @Column(name = "mod_user", length = 50)
    private String mod_user; // 수정자
    
    @Column(name = "mod_date")
    private LocalDate mod_date; // 수정일
}