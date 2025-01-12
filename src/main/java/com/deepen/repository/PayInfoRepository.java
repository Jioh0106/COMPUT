package com.deepen.repository;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.deepen.entity.PayInfo;

@Repository
public interface PayInfoRepository extends JpaRepository<PayInfo, Long> {
    @Query("SELECT p FROM PayInfo p WHERE p.empId IN :empIds")
    List<PayInfo> findByEmpIds(@Param("empIds") List<String> empIds);
    
    List<PayInfo> findByEmpIdAndPaymentDate(String empId, String paymentDate);
    boolean existsByEmpIdAndPaymentDate(String empId, String paymentDate);
}