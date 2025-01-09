package com.deepen.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deepen.entity.Request;

@Repository
public interface RequestRepository extends JpaRepository<Request, Integer> {
	
	//요청내역 모두 조회
	
	
}
