package com.deepen.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.deepen.domain.AbsenceDTO;
import com.deepen.domain.RequestDTO;
import com.deepen.domain.WorkDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "WORK")
@Data
public class Work {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "work_no", nullable = false)
	private Integer work_no;
	
	@Column(name = "emp_id", length = 30, nullable = false)
	private String emp_id;
	
	@Column(name = "work_date", nullable = false)
	private LocalDate work_date;

	@Column(name = "work_time")
	private Integer work_time;
	
	@Column(name = "rest_type")
	private Integer rest_type;
	
	@Column(name = "work_tmp_name", length = 30)
	private String work_tmp_name;
	
	
	public static Work absenceDTOToEntity(WorkDTO workDTO) {
		Work work = new Work();
		work.setWork_no(workDTO.getWork_no());
		work.setEmp_id(workDTO.getEmp_id());
		work.setWork_date(workDTO.getWork_date());
		work.setWork_time(workDTO.getWork_time());
		work.setRest_type(workDTO.getRest_type());
		work.setWork_tmp_name(workDTO.getWork_tmp_name());
		
		return work;
	}
	
	

}
