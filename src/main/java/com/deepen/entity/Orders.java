package com.deepen.entity;

import java.sql.Timestamp;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Data;

@Entity
@Table(name = "ORDERS")
@Data
public class Orders {
	
	@Id
	@Column(name = "order_id", length = 30, nullable = false)
	private String order_id;
	
	@Column(name = "order_date", nullable = false)
	private Timestamp order_date;
	
	@Column(name = "order_emp", length = 30, nullable = false)
	private String order_emp;
	
	@Column(name = "order_type", length = 30, nullable = false)
	private String order_type;
	
	@Column(name = "client_no", nullable = false)
	private Integer client_no;
	
	@Column(name = "order_update")
	private Timestamp order_update;
	
	
	
}
