package com.deepen.domain;

import java.time.LocalDate;

import lombok.Data;

@Data
public class WarehouseDTO {
	
	 	private String warehouse_id;   		// 창고 id
	    private String warehouse_name; 		// 창고명
	    private String warehouse_type; 		// 창고 유형
	    private String location;       		// 위치
	    private String zone;				// 구역
	    private String manager;       		// 관리자
	    private String status;         		// 상태
	    private LocalDate reg_date;         // 등록일시
	    private LocalDate mod_date;         // 수정일시
	    
}