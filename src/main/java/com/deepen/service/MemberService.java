package com.deepen.service;


import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.MemberDTO;
import com.deepen.entity.Member;
import com.deepen.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class MemberService {
	
	private final MemberRepository repository;

	
	public void save(MemberDTO memberDTO) {
		
		memberDTO.setReg_date(new Timestamp(System.currentTimeMillis()));
		Member member = Member.setMember(memberDTO);
		repository.save(member);
		
		
	}

	// id 값으로 기존 회원 여부 조회 / 중복 아이디 거부
	public boolean existMember(String id) {
		boolean existing = repository.existsById(id);
		
		return existing;
	}
	
	// 로그인 정보 일치 여부 확인
	public Member compareMember(MemberDTO memberDTO) {
		// 아이디, 비밀번호가 일치하는 레코드 
		Member member = repository.findByIdAndPass(memberDTO.getId(), memberDTO.getPass());
		
		return member;
	}
	
	// 전체 회원 목록 가져오기
	public List<Member> getMemberList() {
		
		return repository.findAll();
	}
	
	// 아이디로 멤버 정보 가져오기
	public Optional<Member> getMember(String id) {
		return repository.findById(id);
	}
	
	
	// 회원정보 수정 
	public void updateMember(MemberDTO memberDTO) {
		Member member = Member.setMember(memberDTO);
		repository.save(member);
	}
	
}

