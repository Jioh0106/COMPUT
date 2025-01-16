package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.deepen.service.CommuteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class CommuteController {

	private final CommuteService service;

	/**
	 * 출퇴근 현황
	 * @view model
	 * @return String
	 */
	@GetMapping("/cmt-stts")
	public String cmtMng(Model model) {
		// http://localhost:8082/cmt-stts

		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(userId);

		// 로그인 유저에 대한 정보를 담은 변수 선언s
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String athr = (String) empAthr.get("EMP_ROLE"); // 로그인 유저 권한
		String no = String.valueOf(empAthr.get("EMP_NO")); // 로그인 유저 인덱스(사원번호)
		// String athrStr = athr.replaceAll("[0-9]", ""); // 정규식으로 문자열만 추출

		// 새로운 map에 정보 담기
		Map<String, Object> athrMapList = new HashMap();
		athrMapList.put("empRole", athr);
		athrMapList.put("empDept", dept);
		athrMapList.put("empNo", no);

		// 권한, 부서, 사원번호 담은 map 들고 조회
		List<Map<String, Object>> cmtList = service.selectCmtList(athrMapList);
		model.addAttribute("cmtList", cmtList);

		// System.out.println(cmtList.toString());

		return "attendance/cmt_stts";
	}

	/**
	 * 검색 조건 지정하여 조회 
	 * @param searchMap
	 * @return List<Map>
	 */
	@PostMapping("/searchCmt")
	@ResponseBody
	public List<Map<String, Object>> searchCmt(@RequestBody Map<String, Object> searchMap) {
		// 로그인한 유저 아이디 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UserDetails userDetails = (UserDetails) principal;
		String userId = userDetails.getUsername();

		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(userId);

		// 로그인 유저에 대한 정보를 담은 변수 선언
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String athr = (String) empAthr.get("EMP_ROLE"); // 로그인 유저 권한
		String no = String.valueOf(empAthr.get("EMP_NO")); // 로그인 유저 인덱스(사원번호)

		searchMap.put("empRole", athr);
		searchMap.put("empDept", dept);
		searchMap.put("empNo", no);

		// 검색 조건 조회
		List<Map<String, Object>> searchCmtList = service.selectCmtList(searchMap);

		System.out.println(searchCmtList.toString());

		return searchCmtList;
	}
	
	@PostMapping("/mainCmt")
	@ResponseBody
	public Map<String, Object>  mainCmt(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> searchMap) {
		
		searchMap.put("empId", String.valueOf(user.getUsername()));
		Map<String, Object> resultMap = service.mainCmt(searchMap);
		System.out.println(resultMap.toString());
		
		return resultMap;
	}
	
	@PostMapping("/insertCmt")
	@ResponseBody
	public int insertCmt(@AuthenticationPrincipal User user/*, @RequestBody Map<String, Object> searchMap*/) {
		
		// 로그인한 유저 아이디 값으로 사원 테이블에서 권한 조회
		Map<String, Object> empAthr = service.selectEmpAthr(user.getUsername());
		
		Map<String, Object> searchMap = new HashMap<>();
		
		// 로그인 유저에 대한 정보를 담은 변수 선언
		String id = user.getUsername(); // 로그인 유저 사원번호
		String dept = (String) empAthr.get("EMP_DEPT"); // 로그인 유저 부서
		String no = String.valueOf(empAthr.get("EMP_NO")); // 로그인 유저 인덱스(사원번호)
		
		searchMap.put("empId", String.valueOf(user.getUsername()));
		searchMap.put("empDept", dept);
		searchMap.put("empNo", no);
		
		int result = service.insertCmt(searchMap);
		
		return result;
	}

}