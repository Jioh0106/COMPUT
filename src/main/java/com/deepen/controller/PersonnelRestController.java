package com.deepen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.service.PersonnelService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@Log
public class PersonnelRestController {
	
	
	private final PersonnelService psService;
	
	@GetMapping("/commonDetail")
	public List<CommonDetailDTO> fetchCommonDetailCodeList() {
		
		List<CommonDetailDTO> cdDetailList = psService.fetchCommonDetailCodeList();
		log.info(cdDetailList.toString());
		
		return cdDetailList;
	}
	
	@GetMapping("/emp-list")
	public List<Map<String, Object>> empList(
			@RequestParam(value = "startDate")String startDate,
			@RequestParam(value = "endDate")String endDate,
			@RequestParam(value = "search", defaultValue = "")String search) {
		
		//log.info("C fitter: "+startDate+", "+endDate+", "+search);
		
		List<Map<String, Object>> empList = psService.getEmpList(startDate,endDate,search);
		
		return empList;
	}
	
	@PostMapping("/emp-delete")
	public String postMethodName(@RequestBody List<String> ids) {
		log.info("삭제할 ids - "+ids);
		psService.deleteAllEmpById(ids);
		return "서버 : 삭제 성공";
	}
	
	@GetMapping("/count-by-edu")
	public List<Map<String, Object>> countListByEdu() {
		
		return psService.getCountByEdu();
	}
	
	@GetMapping("/infoList-by-edu")
	public List<Map<String, Object>> empinfoListByEdu(@RequestParam(value = "edu") List<String> edu){
		log.info(edu.toString());
		
		return psService.getInfoListByEdu(edu);
	}
	
	@GetMapping("/count-by-ageGroupAndGender")
	public List<Map<String, Object>> countListByAgeAndGender(){
		log.info(psService.getCountByAgeGroupAndGender().toString());
		
		return psService.getCountByAgeGroupAndGender();
	}
	
	@GetMapping("/infoList-by-ageGroup")
	public List<Map<String, Object>> empinfoListAgeGroup(@RequestParam(value = "ageGroup") List<String> ageGroup){
		return psService.getInfoListByAgeGroup(ageGroup);
	}
}
