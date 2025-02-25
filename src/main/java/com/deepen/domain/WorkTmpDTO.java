package com.deepen.domain;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class WorkTmpDTO {
	
	private String work_tmp_name;
	private String work_start;
	private String work_end;
	private String work_shift;
	private String work_type;
	private BigDecimal  work_time;
	private BigDecimal  rest_time;
	// ------------------------------
	private String shift_name;
	private String type_name;

}
