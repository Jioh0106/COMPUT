package com.deepen.entity;

import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "process_info")
@Data
public class ProcessInfo {
    @Id
    @Column(name = "process_no")
    private Integer processNo;

    @Column(name = "process_name")
    private String processName;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private String isActive;

    @Column(name = "process_priority")
    private Integer processPriority;

    @Column(name = "created_date")
    private LocalDate createdDate;

    @Column(name = "updated_date")
    private LocalDate updatedDate;
}