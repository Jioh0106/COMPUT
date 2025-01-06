package com.deepen.repository;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.deepen.entity.CommonDetail;

@Repository
public interface CommonDetailRepository extends JpaRepository<CommonDetail, String> {
    // 언더스코어 제거하고 카멜케이스로 작성
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code = :code")
    Optional<CommonDetail> findByCode(@Param("code") String code);
    
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_name = :name")
    Optional<CommonDetail> findByName(@Param("name") String name);
    
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_status = :status")
    List<CommonDetail> findByStatus(@Param("status") String status);
    
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code LIKE :prefix% ORDER BY c.common_detail_code DESC")
    List<CommonDetail> findByCommonDetail(@Param("prefix") String prefix);
}
