package com.deepen.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "qc_master")
@Data
public class QcMaster {
    @Id
    @Column(name = "qc_code", nullable = false)
    private String qcCode;
    
    @Column(name = "qc_name")
    private String qcName;
    
    @ManyToOne
    @JoinColumn(name = "process_no")
    private ProcessInfo process;
    
    @Column(name = "target_value", precision = 10, scale = 2)
    private BigDecimal targetValue;
    
    @Column(name = "ucl", precision = 10, scale = 2)
    private BigDecimal ucl;
    
    @Column(name = "lcl", precision = 10, scale = 2)
    private BigDecimal lcl;
    
    @ManyToOne
    @JoinColumn(name = "unit", referencedColumnName = "common_detail_code")
    private CommonDetail unit;
    
    @Column(name = "qc_method")
    private String qcMethod;
    
    @Column(name = "use_yn", nullable = false)
    private String useYn;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
