package com.deepen.domain;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class WorkDTO {
	
	private Integer work_no;
	private String emp_id;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate work_date;
	private String work_tmp_name;
	
	// ===============================
	
	private String emp_name;
	private String emp_dept;
	private String dept_name;
	private String work_start;
	private String work_end;
	private String work_shift;
	private String shift_name;
	private String work_type;
	private String type_name;
	private Integer work_time;
	private Integer rest_time;
	
	
	
	@Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WorkDTO workDTO = (WorkDTO) o;
        return Objects.equals(emp_id, workDTO.emp_id) &&
               Objects.equals(work_date, workDTO.work_date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(emp_id, work_date);
    }

}
