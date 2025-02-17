package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.mapper.ProductionHistoryMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class ProductionHistoryService {
	
	private final ProductionHistoryMapper prdctMapper;
	
	//생산이력
	public List<Map<String, Object>> historyList(){
		return prdctMapper.historyList();
	}
	
}
