package com.deepen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Holiday;

public interface HolidayRepository extends JpaRepository<Holiday, Integer>{
	List<Holiday> findByYearAndMonth(int year, int month); // 특정 연/월 공휴일 조회
}
