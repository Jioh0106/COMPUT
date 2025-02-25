package com.deepen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "HOLIDAY")
@Data
public class Holiday {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "holiday_no", nullable = false)
	private Integer holiday_no; //요청번호
	
	@Column(name = "date_name", length = 100, nullable = false)
	private String date_name;
	
	@Column(name = "locdate", length = 10, nullable = false)
	private String locdate;
	
	@Column(name = "year")
	private int year;
	
	@Column(name = "month")
	private int month;
	
    public Holiday(String date_name, String locdate, int year, int month) {
        this.date_name = date_name;
        this.locdate = locdate;
        this.year = year;
        this.month = month;
    }

}
