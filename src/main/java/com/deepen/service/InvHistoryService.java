package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.InventoryHistoryMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class InvHistoryService {
	
	private final InventoryHistoryMapper invhMapper;
	
	//변경사유 공통코드
	public List<Map<String, Object>> reasonChangeList(){
		return invhMapper.reasonChangeList();
	}
	
	
}
