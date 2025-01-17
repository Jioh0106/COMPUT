package com.deepen.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.deepen.entity.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
	 
	//중요** 요청번호가 발령테이블에서는 PK가 아니기때문에 findById메서드 못 씀. 따로 하나 만들어줘야함.
	// JAP는 _ 못 쓰기 때문에 엔티티 필드명에 _를 없애던가, _쓸거면 @Query어노테에션 써야함.
	@Query("SELECT a FROM Assignment a WHERE a.request_no = :requestNo")
    Optional<Assignment> findByRequest_no(@Param("requestNo") Integer requestNo);
   
}
