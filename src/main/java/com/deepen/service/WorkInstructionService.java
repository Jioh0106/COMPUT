package com.deepen.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.mapper.WorkInstructionMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class WorkInstructionService {
	private final WorkInstructionMapper wiMapper;
	
	// 작업담장자 정보
	public List<Map<String, Object>> getWorkerListByPosition(){
		return wiMapper.selectWokerInfoListByPosition();
	}
	
	// 공정 정보
	public List<ProcessInfoDTO> getProcessList(){
		return wiMapper.selectProcessInfo();
	}
	
	// 라인 정보
	public List<LineInfoDTO> getLineList() {
		return wiMapper.selectLineInfo();
	}
	
	// 작업 지시 정보 불러오기
	public List<Map<String, Object>> getWorkInstruction() {
		
		// 작업계획에서 받아온 정보 작업 지시 정보에 insert 후 조회
		// insert 데이터 - 지시번호, 계획번호, 품목번호, 품목, 수량, 상태="대기중"(공통코드)
		
		
		return null;
	}
	
}
