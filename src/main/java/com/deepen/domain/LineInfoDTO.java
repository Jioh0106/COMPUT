package com.deepen.domain;

import java.time.LocalDate;
import lombok.Data;

@Data
public class LineInfoDTO {
    private Integer lineNo;
    private String processName;
    private String description;
    private String isActive;
    private LocalDate createdDate;
    private LocalDate updatedDate;
}