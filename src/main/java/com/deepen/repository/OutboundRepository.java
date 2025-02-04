package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Inbound;
import com.deepen.entity.Outbound;

public interface OutboundRepository extends JpaRepository<Outbound, Integer>{


	
}