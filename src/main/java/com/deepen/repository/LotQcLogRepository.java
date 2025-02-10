package com.deepen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LotQcLogRepository extends JpaRepository<LotQcLog, Long> {
    
    // 품질검사 대기 목록 조회
    @Query("SELECT l FROM LotQcLog l " +
           "JOIN FETCH l.qcMaster q " +
           "JOIN FETCH l.lotMaster lm " +
           "WHERE lm.lotStatus = :status " +
           "ORDER BY l.createTime DESC")
    List<LotQcLog> findAllByLotStatusOrderByCreateTimeDesc(@Param("status") String status);
    
    // LOT 번호로 품질검사 이력 조회
    @Query("SELECT l FROM LotQcLog l " +
           "WHERE l.lotNo = :lotNo " +
           "ORDER BY l.checkTime DESC")
    List<LotQcLog> findByLotNoOrderByCheckTimeDesc(@Param("lotNo") String lotNo);
    
    // 특정 공정의 품질검사 목록 조회
    @Query("SELECT l FROM LotQcLog l " +
           "JOIN FETCH l.qcMaster q " +
           "WHERE l.processNo = :processNo " +
           "AND lm.lotStatus = :status")
    List<LotQcLog> findByProcessNoAndStatus(
        @Param("processNo") Long processNo, 
        @Param("status") String status);
}