package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.SalaryFormulaDTO;

@Mapper
@Repository
public interface SalaryFormulaMapper {
    
    /**
     * 현재 적용중인 급여 공식 목록 조회
     */
    List<SalaryFormulaDTO> getCurrentFormulas(
//    		@Param("name") String name,
    		@Param("year") int year);
    
    /**
     * 특정 코드의 급여 공식 조회
     */
    SalaryFormulaDTO getFormulaByCode(@Param("code") String code, @Param("year") int year);
    
    /**
     * 특정 유형의 급여 공식 목록 조회
     */
    List<SalaryFormulaDTO> getFormulasByType(
        @Param("type") String type, 
        @Param("year") int year);
}