package com.deepen.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "WAREHOUSE")
@Data
public class Warehouse {
	
		@Id
	    @Column(name = "warehouse_id", length = 20)
	    private String warehouse_id;

	    @Column(name = "warehouse_name", nullable = false, length = 100)
	    private String warehouse_name;

	    @Column(name = "warehouse_type", nullable = false, length = 20)
	    private String warehouse_type;

	    @Column(name = "location", nullable = false, length = 200)
	    private String location;
	    
	    @Column(name = "zone", nullable = false, length = 20)
	    private String zone;
	    
	    @Column(name = "manager", nullable = false, length = 50)
	    private String manager;

	    @Column(name = "status", nullable = false, length = 20)
	    private String status;

	    @Column(name = "reg_date", nullable = false)
	    private LocalDate reg_date;

	    @Column(name = "mod_date")
	    private LocalDate mod_date;
}