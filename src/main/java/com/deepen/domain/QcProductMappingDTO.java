package com.deepen.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QcProductMappingDTO {
    private Integer mappingId;
    private String qcCode;
    private Integer product_no;
    private BigDecimal targetValue;
    private BigDecimal ucl;
    private BigDecimal lcl;
    private String useYn;
    private String unit;
    private String unitName;
    private LocalDateTime createTime;
    private String createUser;
    private LocalDateTime updateTime;
    private String updateUser;
    
    // 추가 표시용 필드
    private String qcName;
    private String product_name;
}