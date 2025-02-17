package com.deepen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.QcProductMapping;

@Repository
public interface QcProductMappingRepository extends JpaRepository<QcProductMapping, Integer> {
    
    // QC 코드로 제품별 기준 조회
    List<QcProductMapping> findByQcMaster_QcCode(String qcCode);
    
    // QC 코드와 사용여부로 제품별 기준 조회
    List<QcProductMapping> findByQcMaster_QcCodeAndUseYn(String qcCode, String useYn);
    
    @Query("SELECT qpm FROM QcProductMapping qpm WHERE qpm.product.product_no = :product_no")
    List<QcProductMapping> findByProductProductNo(@Param("product_no") Integer product_no);
    
    @Query("SELECT qpm FROM QcProductMapping qpm " +
	       "WHERE qpm.qcMaster.qcCode = :qcCode " +
	       "AND qpm.product.product_no = :product_no")
	Optional<QcProductMapping> findByQcMasterQcCodeAndProductProductNo(
	    @Param("qcCode") String qcCode, 
	    @Param("product_no") Integer product_no
	);
    
    // 검색 조건을 이용한 조회
    @Query("SELECT qpm FROM QcProductMapping qpm " +
           "JOIN FETCH qpm.qcMaster qc " +
           "JOIN FETCH qpm.product p " +
           "WHERE (:qcCode IS NULL OR qc.qcCode = :qcCode) " +
           "AND (:productNo IS NULL OR p.product_no = :productNo) ")
    List<QcProductMapping> findBySearchConditions(
        @Param("qcCode") String qcCode,
        @Param("productNo") Integer product_no
    );
}