package com.deepen.entity;

import java.sql.Timestamp;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "PLANS")
@Data
public class Plans {
	
	@Id
	@Column(name = "plan_id", length = 30, nullable = false)
	private String plan_id;
	
	@Column(name = "order_id", length = 30, nullable = false)
	private String order_id;
	
	@Column(name = "sale_no", nullable = false)
	private Integer sale_no;
	
	@Column(name = "emp_id", length = 30, nullable = false)
	private String emp_id;
	
	@Column(name = "plan_status", length = 30, nullable = false)
	private String plan_status;
	
	@Column(name = "plan_priority", length = 30, nullable = false)
	private String plan_priority;

	@Column(name = "plan_date", nullable = false)
	private Timestamp plan_date;
	
	@Column(name = "plan_update")
	private Timestamp plan_update;
	
	@Column(name = "plan_start_date", nullable = false)
	private LocalDate plan_start_date;
	
	@Column(name = "plan_end_date", nullable = false)
	private LocalDate plan_end_date;
	
	
	
}
