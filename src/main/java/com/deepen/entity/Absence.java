package com.deepen.entity;

import java.time.LocalDate;

import com.deepen.domain.AbsenceDTO;
import com.deepen.domain.RequestDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ABSENCE")
@Data
public class Absence {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "absence_no", nullable = false)
	private Integer absence_no; //요청번호
	
	@Column(name = "emp_id", length = 30, nullable = false)
	private String emp_id;
	
	@Column(name = "absence_type", length = 50, nullable = false)
	private String absence_type;
	
	@Column(name = "absence_start", nullable = false)
	private LocalDate absence_start;

	@Column(name = "absence_end", nullable = false)
	private LocalDate absence_end;
	
	@Column(name = "request_no")
	private Integer request_no;
	
	@Column(name = "absence_remark", length = 300)
	private String absence_remark;
	
	public static Absence absenceDTOToEntity(AbsenceDTO absenceDTO) {
		Absence absence = new Absence();
		absence.setAbsence_no(absenceDTO.getAbsence_no());
		absence.setEmp_id(absenceDTO.getEmp_id());
		absence.setAbsence_type(absenceDTO.getAbsence_type());
		absence.setAbsence_start(absenceDTO.getAbsence_start());
		absence.setAbsence_end(absenceDTO.getAbsence_end());
		absence.setAbsence_no(absenceDTO.getAbsence_no());
		absence.setAbsence_remark(absenceDTO.getAbsence_remark());
		
		
		return absence;
	}
	
	

}
