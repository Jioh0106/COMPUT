package com.deepen.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.service.VacationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class VacationController {

	private final VacationService service;

	// 휴가 관리
	@GetMapping("/vctn-mng")
	public String vctnMng(Model model) {
		// http://localhost:8082/vctn-mng

		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(userId);

		// 로그인 유저에 대한 정보를 담은 변수 선언s
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String athr = (String) empAthr.get("EMP_ROLE"); // 로그인 유저 권한
		String id = String.valueOf(empAthr.get("EMP_ID")); // 로그인 유저 인덱스(사원번호)
		// String athrStr = athr.replaceAll("[0-9]", ""); // 정규식으로 문자열만 추출

		// 새로운 map에 정보 담기
		Map<String, Object> athrMapList = new HashMap();
		athrMapList.put("empRole", athr);
		athrMapList.put("empDept", dept);
		athrMapList.put("empId", id);

		// 권한, 부서, 사원번호 담은 map 들고 조회
		List<Map<String, Object>> useVctnList = service.selectUseVctnList(athrMapList);
		model.addAttribute("useVctnList", useVctnList);

		List<Map<String, Object>> vctnDaysList = service.selectVctnDaysList(athrMapList);
		model.addAttribute("vctnDaysList", vctnDaysList);

		return "attendance/vctn_mng";
	}

	/**
	 * 화면 진입 시 자동으로 날짜 조건 조회
	 * @param searchMap
	 * @return
	 */
	@PostMapping("/useVctnList")
	@ResponseBody
	public List<Map<String, Object>> useVctnList(@RequestBody Map<String, Object> searchMap) {
		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(userId);

		// 로그인 유저에 대한 정보를 담은 변수 선언
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String athr = (String) empAthr.get("EMP_ROLE"); // 로그인 유저 권한
		String no = String.valueOf(empAthr.get("EMP_ID")); // 로그인 유저 인덱스(사원번호)

		searchMap.put("empRole", athr);
		searchMap.put("empDept", dept);
		searchMap.put("empId", no);

		List<Map<String, Object>> searchVcntList = service.selectUseVctnList(searchMap);

		return searchVcntList;
	}

	/**
	 * 휴가 신청서
	 * 
	 * @view model
	 * @return String
	 */
	@GetMapping("/vctn-appform")
	public String insertVctn(Model model) {
		// http://localhost:8082/vctn-appform

		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();
		Map<String, Object> map = new HashMap<>();
		map.put("empId", userId);
		// 로그인한 유저 아이디 값으로 사원 테이블에서 정보 조회
		Map<String, Object> empInfo = service.selectEmpInfo(map);
		model.addAttribute("empInfo", empInfo);

		// 휴가 종류 조회
		List<Map<String, Object>> commonDtlList = service.selectCommonDtl();
		model.addAttribute("commonDtlList", commonDtlList);

		// 중간승인권자 조회
		List<Map<String, Object>> middleAprvr = service.selectAprvr("ATHR002");
		model.addAttribute("middleAprvr", middleAprvr);

		return "attendance/vctn_appform";
	}
	
	/**
	 * 휴가 구분에 따른 잔여일수
	 * @param vctnType
	 * @return int
	 */
	@PostMapping("/vctnDays")
	@ResponseBody
	public int vctnDays(@RequestBody Map<String, Object> vctnType) {
		return service.workDays(vctnType);
	}

	/**
	 * 휴가 및 요청내역 테이블 삽입
	 * 
	 * @param map
	 * @return int
	 */
	@PostMapping("/insertVctn")
	@ResponseBody
	public int insertVctn(@RequestBody Map<String, Object> map) {

		Map<String, Object> vctnMap = (Map<String, Object>) map.get("vctnDTO"); // 휴가정보
		Map<String, Object> rqstMap = (Map<String, Object>) map.get("rqstDTO"); // 요청정보

		int result = service.insertVctn(vctnMap, rqstMap);

		return result;
	}

	@PostMapping("/searchVcnt")
	@ResponseBody
	public List<Map<String, Object>> searchVcnt(@RequestBody Map<String, Object> searchMap) {
		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(userId);

		// 로그인 유저에 대한 정보를 담은 변수 선언
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String athr = (String) empAthr.get("EMP_ROLE"); // 로그인 유저 권한
		String no = String.valueOf(empAthr.get("EMP_ID")); // 로그인 유저 인덱스(사원번호)

		searchMap.put("empRole", athr);
		searchMap.put("empDept", dept);
		searchMap.put("empId", no);

		// 검색 조건 조회
		List<Map<String, Object>> searchVcntList = new ArrayList<>();
		String activeTab = String.valueOf(searchMap.get("activeTab"));
		if (activeTab.equals("useTab")) {
			searchVcntList = service.selectUseVctnList(searchMap);
		} else {
			searchVcntList = service.selectVctnDaysList(searchMap);
		}

		return searchVcntList;
	}

}