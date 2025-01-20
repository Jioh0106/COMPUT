package com.deepen.controller;

import java.util.List;

import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.PayInfoDTO;
import com.deepen.domain.PayListDTO;
import com.deepen.entity.PayInfo;
import com.deepen.entity.SalaryFormula;
import com.deepen.mapper.PayInfoMapper;
import com.deepen.repository.PayInfoRepository;
import com.deepen.service.PayInfoService;
import com.deepen.service.PayListService;
import com.deepen.service.SalaryFormulaService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PayrollController {


    private final SalaryFormulaService salaryFormulaService;
    private final PayInfoService payInfoService;
    private final PayListService payListService;
    private final PayInfoMapper payInfoMapper;
    private final PayInfoRepository payInfoRepository;
    
    // 급여 종류 관리 추가 GET
    @GetMapping("/pay-mng")
    public String payMng(Model model) {
        List<SalaryFormula> formulas = salaryFormulaService.findAll();
        model.addAttribute("formulas", formulas);
        return "payroll/pay_mng";
    }
    
    // 급여 지급 이력
    @GetMapping("/pay-info")
    public String payrollMain(Model model) {
        List<PayInfoDTO> payInfoList = payInfoService.getAllPayInfo();
        model.addAttribute("payInfoList", payInfoList);
        System.out.println(payInfoList);
        return "payroll/pay_info";
    }
    
    // 급여 대장 관리
    @GetMapping("/pay-list")
    public String payList(
        @RequestParam(name="viewType",required=false) String viewType,@RequestParam(name="keyword",required=false) String keyword,Model model){
        List<PayListDTO> payListSummary = payListService.getMonthlyPayrollSummary(viewType, keyword);
        model.addAttribute("payListSummary", payListSummary);
        return "payroll/pay_list";
    }
    
    // 연봉 시뮬레이션 페이지 반환
    @GetMapping("/simulate")
    public String simulatorPage() {
        return "payroll/simulator";
    }
    
    // 급여명세서 미리보기
    @GetMapping("/pay-info/payslip-preview/{paymentNo}")
    public String payslipPreview(
            @PathVariable("paymentNo") Long paymentNo,
            @RequestParam("empName") String empName,
            Model model,
            HttpServletRequest request) {
        PayInfo payInfo = payInfoRepository.findById(paymentNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 급여 정보가 없습니다."));
                
        PayInfoDTO payInfoDTO = payInfoMapper.getAllPayInfo().stream()
                .filter(dto -> dto.getPaymentNo().equals(paymentNo))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 급여 정보를 찾을 수 없습니다."));
                
        model.addAttribute("payInfo", payInfo);
        model.addAttribute("empName", empName);
        model.addAttribute("departmentName", payInfoDTO.getDepartmentName());
        model.addAttribute("positionName", payInfoDTO.getPositionName());
        model.addAttribute("preview", true);  // 미리보기 모드 플래그 추가
        
        CsrfToken token  = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (token  != null) {
            model.addAttribute("_csrf", token);
        }
        
        return "payroll/payslip";  // 기존 payslip.html 템플릿 사용
    }
}