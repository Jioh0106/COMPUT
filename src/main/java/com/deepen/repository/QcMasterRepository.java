package com.deepen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.QcMaster;

@Repository
public interface QcMasterRepository extends JpaRepository<QcMaster, String> {
    
    // 검색 조건을 이용한 조회 (공정, 검사명)
    @Query("SELECT q FROM QcMaster q " +
           "LEFT JOIN FETCH q.process p " +
           "LEFT JOIN FETCH q.unit u " +
           "WHERE (:process_no IS NULL OR p.processNo = :process_no) " +
           "AND (:searchName IS NULL OR q.qcName LIKE %:searchName%) " +
           "ORDER BY q.qcCode")
    List<QcMaster> findBySearchConditions(
        @Param("process_no") Integer process_no,
        @Param("searchName") String searchName
    );

    // 마지막 QC 코드 조회 (코드 생성용)
    Optional<QcMaster> findTopByOrderByQcCodeDesc();
    
    // 공정별 QC 항목 조회
    List<QcMaster> findByProcess_ProcessNoAndUseYn(Integer process_no, String useYn);
    
    // 단위별 QC 항목 조회
    @Query("SELECT q FROM QcMaster q WHERE q.unit.common_detail_code = :unitCode AND q.useYn = :useYn")
    List<QcMaster> findByUnitCodeAndUseYn(@Param("unitCode") String unitCode, @Param("useYn") String useYn);
    
    // 검사명으로 검색
    List<QcMaster> findByQcNameContainingAndUseYn(String qcName, String useYn);
}