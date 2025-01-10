package com.deepen.domain;

import lombok.Data;
import oracle.sql.DATE;

@Data
public class AbsenceDTO {
	
	private Integer absence_no;
	private String emp_id;
	private String absence_type;
	private DATE absence_start;
	private DATE absence_end;
	private Integer request_no;
	private String absence_remark;
	

}
