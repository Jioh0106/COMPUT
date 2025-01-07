package com.deepen.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.deepen.domain.BoardDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.entity.Board;
import com.deepen.entity.CommonDetail;
import com.deepen.mapper.CommonMapper;
import com.deepen.repository.BoardRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class CommonService {
	
	private final CommonMapper mapper;
	
	public List<Map<String, Object>> commonList() {
		return mapper.commonList();
	}
	
	

}

