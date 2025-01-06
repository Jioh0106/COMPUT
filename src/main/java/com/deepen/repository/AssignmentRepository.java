package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
	
}
