package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Request;

public interface RequestRepository extends JpaRepository<Request, Integer> {
	
	
	
}
