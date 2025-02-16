package com.deepen.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "qc_product_mapping")
@Data
public class QcProductMapping {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "QC_PRODUCT_MAPPING_SEQ")
    @SequenceGenerator(
        name = "QC_PRODUCT_MAPPING_SEQ",
        sequenceName = "seq_qc_mapping_id",
        allocationSize = 1
    )
    private Integer mappingId;
    
    @ManyToOne
    @JoinColumn(name = "qc_code")
    private QcMaster qcMaster;
    
    @ManyToOne
    @JoinColumn(name = "product_no")
    private Product product;
    
    @Column(name = "target_value", precision = 10, scale = 2)
    private BigDecimal targetValue;
    
    @Column(name = "ucl", precision = 10, scale = 2)
    private BigDecimal ucl;
    
    @Column(name = "lcl", precision = 10, scale = 2)
    private BigDecimal lcl;
    
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "create_user", length = 20)
    private String createUser;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @Column(name = "update_user", length = 20)
    private String updateUser;
}