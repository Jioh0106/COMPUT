package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.CommonMapper;

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

	public List<Map<String, Object>> commonDtlList(String commonCd) {
		return mapper.commonDtlList(commonCd);
	}

}
