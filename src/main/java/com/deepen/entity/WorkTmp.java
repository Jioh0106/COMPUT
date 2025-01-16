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
	
	@Column(name = "work_tmp_start", length = 30, nullable = false)
	private String work_tmp_start;

	@Column(name = "work_tmp_end", length = 30, nullable = false)
	private String work_tmp_end;
	
	@Column(name = "work_shift", length = 30)
	private String work_shift;
	
	@Column(name = "work_type", length = 30)
	private String work_type;
	
	public static WorkTmp absenceDTOToEntity(WorkTmpDTO workTmpDTO) {
		WorkTmp workTmp = new WorkTmp();
		workTmp.setWork_tmp_name(workTmpDTO.getWork_tmp_name());
		workTmp.setWork_tmp_start(workTmpDTO.getWork_tmp_start());
		workTmp.setWork_tmp_end(workTmpDTO.getWork_tmp_end());
		workTmp.setWork_shift(workTmpDTO.getWork_shift());
		workTmp.setWork_type(workTmpDTO.getWork_type());
		
		return workTmp;
	}
	
	

}
