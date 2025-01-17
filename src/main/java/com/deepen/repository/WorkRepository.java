package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Work;

public interface WorkRepository extends JpaRepository<Work, Integer>{

}
