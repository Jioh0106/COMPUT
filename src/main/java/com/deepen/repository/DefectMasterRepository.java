package com.deepen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.DefectMaster;

@Repository
public interface DefectMasterRepository extends JpaRepository<DefectMaster, String> {
    
    @Query("SELECT d FROM DefectMaster d " +
           "WHERE (:processNo IS NULL OR d.processNo = :processNo) " +
           "AND (:searchName IS NULL OR d.defectName LIKE %:searchName%) " +
           "AND d.useYn = :useYn")
    List<DefectMaster> findBySearchConditions(
        @Param("processNo") Integer processNo,
        @Param("searchName") String searchName,
        @Param("useYn") String useYn
    );

    Optional<DefectMaster> findTopByOrderByDefectCodeDesc();
}


