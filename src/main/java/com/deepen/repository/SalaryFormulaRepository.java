package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deepen.entity.SalaryFormula;

@Repository
public interface SalaryFormulaRepository extends JpaRepository<SalaryFormula, Integer> {
	
}
