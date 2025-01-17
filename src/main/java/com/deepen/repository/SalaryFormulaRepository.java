package com.deepen.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.SalaryFormula;

@Repository
public interface SalaryFormulaRepository extends JpaRepository<SalaryFormula, Long> {
	List<SalaryFormula> findByFormulaType(String formulaType);
    
    // 코드 생성을 위한 메서드
    @Query("SELECT s FROM SalaryFormula s WHERE s.commonDetail.common_detail_code LIKE :prefix% ORDER BY s.commonDetail.common_detail_code DESC")
    List<SalaryFormula> findByCodeStartingWith(@Param("prefix") String prefix);

	boolean existsByFormulaName(String formulaName);
}
