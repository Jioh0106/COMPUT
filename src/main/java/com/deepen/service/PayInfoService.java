package com.deepen.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import com.deepen.domain.PayInfoDTO;
import com.deepen.entity.PayInfo;
import com.deepen.mapper.PayInfoMapper;
import com.deepen.repository.PayInfoRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayInfoService {
    
	private final PayInfoRepository payInfoRepository;
    private final PayInfoMapper payInfoMapper;
	
    //급여 내역 리스트
	public List<PayInfoDTO> getAllPayInfo() {
		List<PayInfoDTO> list = payInfoMapper.getAllPayInfo();
	    System.out.println("PayInfo list: " + list); // 데이터 확인
	    return list;
    }
    
	  // 급여 내역 저장
	public Map<String, Object> savePayInfo(List<PayInfoDTO> payInfoDTOList) {
	    Map<String, Object> result = new HashMap<>();
	    List<String> errors = new ArrayList<>();

	    // 현재 로그인한 사용자의 사원번호 가져오기
        String currentEmpId = getCurrentEmpId();
	    
	    for (PayInfoDTO payInfoDTO : payInfoDTOList) {
	        try {
	            // 중복 체크 로직 수정
	            // 동일 사원의 동일 지급월 데이터가 있는지 확인
	            boolean isDuplicate = payInfoRepository.findByEmpIdAndPaymentDate(payInfoDTO.getEmpId(), payInfoDTO.getPaymentDate())
	                .stream()
	                .anyMatch(existing -> 
	                    // paymentNo가 다른 경우에만 중복으로 처리
	                    !existing.getPaymentNo().equals(payInfoDTO.getPaymentNo())
	                );

	            if (isDuplicate) {
	                errors.add(payInfoDTO.getEmpId() + "의 " + payInfoDTO.getPaymentDate() + " 지급월 데이터가 이미 존재합니다.");
	                continue;
	            }

	            // 저장 로직
	            PayInfo payInfo;
	            if (payInfoDTO.getPaymentNo() != null) {
	                // 수정인 경우 기존 데이터 조회
	                payInfo = payInfoRepository.findById(payInfoDTO.getPaymentNo())
	                    .orElseGet(PayInfo::new);
	            } else {
	                // 신규 등록인 경우
	                payInfo = new PayInfo();
	            }
	            
	            // 기본 정보 설정
	            payInfo.setEmpId(payInfoDTO.getEmpId());
	            payInfo.setPaymentDate(payInfoDTO.getPaymentDate());
	            payInfo.setEmpSalary(payInfoDTO.getEmpSalary());
	            
	            // 수당 관련 정보 설정
	            payInfo.setTechAllowance(payInfoDTO.getTechAllowance());
	            payInfo.setPerformanceBonus(payInfoDTO.getPerformanceBonus());
	            payInfo.setTenureAllowance(payInfoDTO.getTenureAllowance());
	            payInfo.setHolidayAllowance(payInfoDTO.getHolidayAllowance());
	            payInfo.setLeaveAllowance(payInfoDTO.getLeaveAllowance()); 
	            payInfo.setAllowAmt(payInfoDTO.getAllowAmt());
	            
	            // 공제 관련 정보 설정
	            payInfo.setNationalPension(payInfoDTO.getNationalPension());
	            payInfo.setLongtermCareInsurance(payInfoDTO.getLongtermCareInsurance()); 
	            payInfo.setHealthInsurance(payInfoDTO.getHealthInsurance());
	            payInfo.setEmploymentInsurance(payInfoDTO.getEmploymentInsurance());
	            payInfo.setIncomeTax(payInfoDTO.getIncomeTax());
	            payInfo.setResidentTax(payInfoDTO.getResidentTax());
	            payInfo.setDeducAmt(payInfoDTO.getDeducAmt());
	            
	            // 최종 급여액 설정
	            payInfo.setNetSalary(payInfoDTO.getNetSalary());
	            
	            // 생성 정보 설정
	            if (payInfo.getCreateAt() == null) {
	                payInfo.setCreateAt(LocalDateTime.now());
	            }
	            if (payInfo.getCreateBy() == null) {
	                payInfo.setCreateBy(currentEmpId); // 임시 작성자
	            }
	            
	            payInfoRepository.save(payInfo);
	        } catch (Exception e) {
	            throw new RuntimeException("급여 정보 저장 중 오류 발생: " + e.getMessage(), e);
	        }
	    }
	    
	    result.put("success", errors.isEmpty());
	    result.put("errors", errors);
	    return result;
	}
	
	  // 모달 창 검색 로직 (전체 재직 사원 검색)
	 public List<PayInfoDTO> searchEmployees(String department, String keyword) {
	        List<PayInfoDTO> employees = payInfoMapper.searchEmployees(department, keyword);
	        return employees;
	    }
	 
    // 부서 목록 조회
    public List<Map<String, String>> getDepartments() {
        return payInfoMapper.getDepartments();
    }
    
    // 메인 페이지 검색 로직 (급여 내역 검색)
    public List<PayInfoDTO> searchPayInfo(String department, String keyword) {
        return payInfoMapper.searchPayInfo(department, keyword);
    }
	
    // 지급월 중복 검사
    public boolean isPaymentMonthDuplicate(String empId, String paymentMonth) {
        return payInfoRepository.existsByEmpIdAndPaymentDate(empId, paymentMonth);
    }
	
    // 현재 로그인한 사용자의 사원번호를 가져오는 메서드
    private String getCurrentEmpId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            // Principal에서 username(사원번호) 가져오기
            if (authentication.getPrincipal() instanceof User) {
                return ((User) authentication.getPrincipal()).getUsername();
            }
            return authentication.getName();
        }
        return "SYSTEM";
    }

    // 특정 사원의 급여 정보 조회
    public List<PayInfoDTO> getEmployeePayInfo(String empId) {
        return payInfoMapper.getEmployeePayInfo(empId);
    }

    // 특정 월의 급여 미지급 직원 목록
   public List<Map<String, Object>> getMissingPaymentEmployees(String paymentDate) {
       // 날짜 형식 검증
       if (!paymentDate.matches("\\d{4}-\\d{2}")) {
           throw new IllegalArgumentException("날짜 형식이 올바르지 않습니다. (YYYY-MM)");
       }
       return payInfoMapper.getMissingPaymentEmployees(paymentDate);
   }
   
   public class SalaryFormulaService {

       public void savePayment(PayInfoDTO payInfoDTO) {
           try {
               payInfoMapper.insertPayment(payInfoDTO);
           } catch (Exception e) {
               throw new RuntimeException("급여 지급 데이터 삽입 중 오류가 발생했습니다: " + e.getMessage());
           }
       }
   }

   @Transactional
   public void deletePayInfo(List<Long> paymentNos) {
       try {
           // 삭제 전 데이터 존재 여부 확인
           List<PayInfo> payInfosToDelete = payInfoRepository.findAllById(paymentNos);
           
           if (payInfosToDelete.isEmpty()) {
               throw new RuntimeException("삭제할 급여 정보가 존재하지 않습니다.");
           }
           
           // 일괄 삭제 실행
           payInfoRepository.deleteAllInBatch(payInfosToDelete);
           
           // 로그 수정
           log.info("급여 정보 삭제 완료 - 삭제된 건수: {}", payInfosToDelete.size());
           
       } catch (Exception e) {
           // 로그 수정
           log.error("급여 정보 삭제 중 오류 발생: {}", e.getMessage());
           throw new RuntimeException("급여 정보 삭제 중 오류가 발생했습니다: " + e.getMessage());
       }
   }

}

	
