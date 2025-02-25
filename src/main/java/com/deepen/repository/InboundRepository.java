package com.deepen.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Inbound;

public interface InboundRepository extends JpaRepository<Inbound, Integer>{

	
}