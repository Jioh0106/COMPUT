package com.deepen.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.deepen.domain.MemberDTO;
import com.deepen.entity.Member;
import com.deepen.service.MemberService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class MemberController {
	
	private final MemberService service;
	
	@GetMapping("/test")
	public String Test() {
		
		return "test";
	}
	
	@GetMapping("/memberJoin")
	public String join() {
		
		return "member/join";
	}
	
	@PostMapping("/memberJoin")
	public String joinPro(MemberDTO member, Model model) {
		
//		boolean existing = service.existMember(member.getId());
		
//		if(existing) {
//			model.addAttribute("msg", "이미 존재하는 회원입니다.");
//			model.addAttribute("targetURL", "");
//			return "result/result";
//		} 
		
		service.save(member);
		model.addAttribute("msg", "회원가입을 환영합니다!");
		model.addAttribute("targetURL", "test");
		
		return "result/result";
		
	}
	
	@GetMapping("memberLogin")
	public String login() {
		
		return "member/login";
	}
	
	
	@PostMapping("/memberLogin")
	public String loginPro(MemberDTO member, Model model, HttpSession session) {
		log.info(member.toString());
		
		Member bdmember = service.compareMember(member);
		
		if(bdmember != null) {
			log.info(bdmember.toString());
			session.setAttribute("id", member.getId());
			return "redirect:/test";
			
		}
		log.info("bdmember == null");
		model.addAttribute("msg", "로그인 정보가 일치하지 않습니다.");
		model.addAttribute("targetURL", "");
		
		return "result/result";
	}
	
	@GetMapping("memberLogout")
	public String Logout(HttpSession session) {
		session.invalidate();
		
		return "redirect:/test";
	}
	
	@GetMapping("memberUpdate")
	public String update(HttpSession session, Model model) {
		String id = (String)session.getAttribute("id");
		Optional<Member> member = service.getMember(id);
		model.addAttribute("member", member.get());
		
		return "member/update";
	}
	
	@PostMapping("/memberUpdate")
	public String memberUpdatePro(MemberDTO member, Model model, HttpSession session) {
		log.info(member.toString());
		
		Member bdmember = service.compareMember(member);
		
		if(bdmember != null) {
			service.updateMember(member);
			return "redirect:/test";
			
		}
		log.info("bdmember == null");
		model.addAttribute("msg", "비밀번호가 일치하지 않습니다. ");
		model.addAttribute("targetURL", "");
		
		return "result/result";
	}
	
	@GetMapping("memberList")
	public String memberList(Model model) {
		List<Member> memberList = service.getMemberList();
		model.addAttribute("memberList", memberList);
		log.info(memberList.toString());
		
		return "member/member_list";
	}
	

}
