package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.PayInfoDTO;

@Mapper
@Repository
public interface PayInfoMapper {
	List<PayInfoDTO> getAllPayInfo();
    List<PayInfoDTO> searchPayInfo(@Param("department") String department, @Param("keyword") String keyword);
    void savePayInfo(PayInfoDTO payInfoDTO);
    List<PayInfoDTO> searchEmployees(@Param("department") String department, @Param("keyword") String keyword);
    List<Map<String, String>> getDepartments(); 
    // 특정 사원의 급여 정보 조회
    List<PayInfoDTO> getEmployeePayInfo(@Param("empId") String empId);
    // 특정 월의 급여 미지급 직원 조회
    List<Map<String, Object>> getMissingPaymentEmployees(@Param("paymentDate") String paymentDate);// 특정 월의 급여 미지급 직원 조회
    
	void insertPayment(PayInfoDTO payInfoDTO);
}