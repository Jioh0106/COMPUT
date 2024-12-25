package com.deepen.entity;

import java.sql.Timestamp;

import com.deepen.domain.MemberDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "MEMBERS")
@Data
public class Member {
	
	@Id
	@Column(name = "id",length = 50)
	private String id;
	
	@Column(name = "pass", nullable = false)
	private String pass;
	
	@Column(name = "name")
	private String name;
	
	@Column(name = "reg_date")
	private Timestamp reg_date;
	
	public static Member setMember(MemberDTO memberDTO) {
		Member member = new Member();
		member.setId(memberDTO.getId());
		member.setPass(memberDTO.getPass());
		member.setName(memberDTO.getName());
		member.setReg_date(memberDTO.getReg_date());
		return member;
	}


}
