package com.deepen.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.MemberDTO;


@Mapper
@Repository
public interface MemberMapper {
	
	MemberDTO getUserById(String id);
	
	
	
	
}
