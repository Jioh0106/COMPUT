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
public class Inbound {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "in_no")
    private int in_no; // 입고번호

    @Column(name = "inventory_no", nullable = false)
    private int inventory_no; // 재고번호

    @Column(name = "in_date", nullable = false)
    private LocalDateTime in_date; // 입고일자

    @Column(name = "in_qty", nullable = false)
    private int in_qty; // 입고수량
    
    @Column(name = "deffect_qty")
    private int deffect_qty; // 불량수량

    @Column(name = "warehouse_id", nullable = false, length = 20)
    private String warehouse_id; // 창고 ID

    @Column(name = "inspector", length = 50)
    private String inspector; // 검수자

    @Column(name = "inspection_result", length = 20)
    private String inspection_result; // 검수 결과

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