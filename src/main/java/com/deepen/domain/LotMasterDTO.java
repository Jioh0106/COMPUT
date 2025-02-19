package com.deepen.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class LotMasterDTO {
    private String lotNo;
    private String parentLotNo;
    private String processType;
    private Integer wiNo;
    private Integer productNo;
    private Integer processNo;
    private String productName;
    private String processName;
    private Integer lineNo;
    private String lotStatus;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String createUser;
    
    private List<LotProcessDTO> processHistory;
    private List<LotQcDTO> qcHistory;
	public void setLotHierarchy(List<LotMasterDTO> lotHierarchy) {
	}
	private List<LotMasterDTO> children = new ArrayList<>();
	public void addChild(LotMasterDTO child) {
        if (this.children == null) {
            this.children = new ArrayList<>();
        }
        this.children.add(child);
    }
}