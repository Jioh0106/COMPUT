package com.deepen.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.Request;

@Repository
public interface RequestRepository extends JpaRepository<Request, Integer> {
	
	//로그인한 자신의 요청내역 조회
	@Query("SELECT r FROM Request r WHERE " +
		       "r.emp_id = :empId OR " +
		       "r.middle_approval = :empId OR " +
		       "r.high_approval = :empId " +  // 공백 추가
		       "ORDER BY r.request_no DESC")
	List<Request> findByEmp_id(@Param("empId") String empId);


}
