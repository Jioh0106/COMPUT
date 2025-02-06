package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "defect_master")
@Data
public class DefectMaster {
    @Id
    @Column(name = "defect_code")
    private String defectCode;

    @Column(name = "defect_name", nullable = false)
    private String defectName;

    @ManyToOne
    @JoinColumn(name = "process_no")
    private ProcessInfo process;

    @Column(name = "defect_type")
    private String defectType;

    @Column(name = "defect_level")
    private String defectLevel;

    @Column(name = "judgment_criteria")
    private String judgmentCriteria;

    @Column(name = "use_yn", nullable = false)
    private String useYn;

    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}