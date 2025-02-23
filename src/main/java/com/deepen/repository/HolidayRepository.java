package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Holiday;

public interface HolidayRepository extends JpaRepository<Holiday, Integer>{

}
