package com.deepen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LOT_QC_LOG")
@Data
@NoArgsConstructor
public class LotQcLog {
    
    @Id
    @Column(name = "QC_LOG_NO")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_QC_LOG_ID")
    @SequenceGenerator(name = "SEQ_QC_LOG_ID", sequenceName = "SEQ_QC_LOG_ID", allocationSize = 1)
    private Long qcLogNo;               // 품질검사 이력번호

    @Column(name = "LOT_NO", length = 20, nullable = false)
    private String lotNo;               // LOT 번호

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROCESS_NO", nullable = false)
    private ProcessInfo process;        // 공정정보

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QC_CODE", nullable = false)
    private QcMaster qcMaster;         // 품질검사 기준정보

    @Column(name = "MEASURE_VALUE", precision = 10, scale = 2)
    private Double measureValue;        // 측정값

    @Column(name = "JUDGEMENT", length = 10)
    private String judgement;           // 판정

    @Column(name = "INSPECTOR", length = 10, nullable = false)
    private String inspector;           // 검사자

    @Column(name = "CHECK_TIME")
    private LocalDateTime checkTime;    // 검사시간

    @Column(name = "CREATE_USER", length = 20, nullable = false)
    private String createUser;          // 생성자

    @Column(name = "CREATE_TIME", nullable = false)
    private LocalDateTime createTime;   // 생성시간

    @Column(name = "NOTE", length = 1000)
    private String note;                // 비고

    @Column(name = "LOT_STATUS", length = 20)
    private String lotStatus;           // LOT 상태

    @PrePersist
    public void prePersist() {
        this.createTime = LocalDateTime.now();
        if (this.lotStatus == null) {
            this.lotStatus = "QC_WAIT";
        }
    }

    // 연관관계 편의 메서드
    public void setProcess(ProcessInfo process) {
        this.process = process;
    }

    public void setQcMaster(QcMaster qcMaster) {
        this.qcMaster = qcMaster;
    }

    // 상태 변경 메서드
    public void startInspection(String inspector) {
        this.inspector = inspector;
        this.lotStatus = "QC_IN_PROGRESS";
        this.checkTime = LocalDateTime.now();
    }

    public void completeInspection(Double measureValue, String judgement, String note) {
        this.measureValue = measureValue;
        this.judgement = judgement;
        this.note = note;
        this.lotStatus = "QC_COMPLETE";
    }

    public void rejectInspection(String note) {
        this.judgement = "NG";
        this.note = note;
        this.lotStatus = "QC_REJECT";
    }
}