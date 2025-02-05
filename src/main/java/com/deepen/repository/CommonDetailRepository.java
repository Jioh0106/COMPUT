package com.deepen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.CommonDetail;

@Repository
public interface CommonDetailRepository extends JpaRepository<CommonDetail, String> {
	@Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code LIKE :prefix% ORDER BY c.common_detail_code DESC")
    List<CommonDetail> findByCommon_detail_codeStartingWithOrderByCommon_detail_codeDesc(@Param("prefix") String prefix);
    
    //이름으로 공통코드 조회
    @Query("SELECT c.common_detail_code FROM CommonDetail c WHERE c.common_detail_name = :commonDetailName")
    String findCommonDetailCodeByName(@Param("commonDetailName") String commonDetailName);
    
    // 단위 코드 조회
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code LIKE 'UNIT%' AND c.common_detail_status = 'Y'")
    List<CommonDetail> findUnitCodes();
    
    // 특정 공통코드로 조회
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code LIKE :code% AND c.common_detail_status = 'Y'")
    List<CommonDetail> findByCommonCode(@Param("code") String code);
}