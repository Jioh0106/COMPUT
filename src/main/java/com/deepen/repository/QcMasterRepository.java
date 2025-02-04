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
    
    @Query("SELECT q FROM QcMaster q " +
           "WHERE (:processNo IS NULL OR :processNo <= 0 OR q.processNo = :processNo) " +
           "AND (:searchName IS NULL OR :searchName = '' OR q.qcName LIKE CONCAT('%', :searchName, '%')) " +
           "AND q.useYn = :useYn")
    List<QcMaster> findBySearchConditions(
        @Param("processNo") Integer processNo,
        @Param("searchName") String searchName,
        @Param("useYn") String useYn
    );

    Optional<QcMaster> findTopByOrderByQcCodeDesc();
    
    @Query("SELECT q FROM QcMaster q WHERE q.processNo = :processNo")
    List<QcMaster> findByProcessNo(@Param("processNo") Integer processNo);
}