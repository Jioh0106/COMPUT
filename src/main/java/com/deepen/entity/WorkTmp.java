package com.deepen.entity;

import com.deepen.domain.WorkTmpDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "WORK_TMP")
@Data
public class WorkTmp {
	
	@Id
	@Column(name = "work_tmp_name", length = 30, nullable = false)
	private String work_tmp_name;
	
	@Column(name = "work_start", length = 30, nullable = false)
	private String work_start;

	@Column(name = "work_end", length = 30, nullable = false)
	private String work_end;
	
	@Column(name = "work_shift", length = 30)
	private String work_shift;
	
	@Column(name = "work_type", length = 30)
	private String work_type;
	
	@Column(name = "work_time")
	private Integer work_time;
	
	@Column(name = "rest_time")
	private Integer rest_time;
	
	public static WorkTmp absenceDTOToEntity(WorkTmpDTO workTmpDTO) {
		WorkTmp workTmp = new WorkTmp();
		workTmp.setWork_tmp_name(workTmpDTO.getWork_tmp_name());
		workTmp.setWork_start(workTmpDTO.getWork_start());
		workTmp.setWork_end(workTmpDTO.getWork_end());
		workTmp.setWork_shift(workTmpDTO.getWork_shift());
		workTmp.setWork_type(workTmpDTO.getWork_type());
		workTmp.setWork_time(workTmpDTO.getWork_time());
		workTmp.setRest_time(workTmpDTO.getRest_time());
		
		return workTmp;
	}
	
	

}
