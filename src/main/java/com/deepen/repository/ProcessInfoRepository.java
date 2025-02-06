package com.deepen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deepen.entity.ProcessInfo;

@Repository
public interface ProcessInfoRepository extends JpaRepository<ProcessInfo, Integer> {

	List<ProcessInfo> findByIsActive(String string);
	
}