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
    List<CommonDetail> findByCommon_detail_codeStartingWith(@Param("prefix") String prefix);
}
