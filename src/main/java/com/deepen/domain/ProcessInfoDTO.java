package com.deepen.domain;

import java.time.LocalDate;
import lombok.Data;

@Data
public class ProcessInfoDTO {
    private Integer processNo;
    private String processName;
    private String description;
    private String isActive;
    private Integer processPriority;
    private LocalDate createdDate;
    private LocalDate updatedDate;
}