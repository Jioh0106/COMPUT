package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Plans;

public interface PlansRepository extends JpaRepository<Plans, String>{

}
