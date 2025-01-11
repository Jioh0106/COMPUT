package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Absence;

public interface AbsenceRepository extends JpaRepository<Absence, Integer>{

}
