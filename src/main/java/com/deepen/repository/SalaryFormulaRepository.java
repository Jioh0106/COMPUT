package com.deepen.repository;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.deepen.entity.SalaryFormula;

@Repository
public interface SalaryFormulaRepository extends JpaRepository<SalaryFormula, Long> {
    @Query("SELECT f FROM SalaryFormula f WHERE f.formulaCode LIKE :prefix% ORDER BY f.formulaCode DESC")
    List<SalaryFormula> findByFormulaType(@Param("prefix") String prefix);
}
