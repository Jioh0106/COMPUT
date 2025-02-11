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
		return wiMapper.selectWorkerInfoListByPosition();
	}
	
	// 공정 정보
	public List<ProcessInfoDTO> getProcessList(){
		return wiMapper.selectProcessInfo();
	}
	
	// 라인 정보
	public List<LineInfoDTO> getLineList() {
		return wiMapper.selectLineInfo();
	}
	
	// 계획에서 작업지시 등록 정보 기져오기
	public List<Map<String, Object>> getRegWorkInstruction(){
		List<Map<String, Object>> list = wiMapper.selectRegWorkInstruction();
		return list;
	}
	
	// 계획에서 가져온 작업지시 정보 테이블에 insert
	public void regWorkInstruction(List<Map<String, Object>> insertList) {
		log.info(insertList.toString());
		
		for(Map<String, Object> insertData : insertList) {
			wiMapper.insertWorkInstruction(insertData);
		}
	}
	
	// 작업 지시 정보 조회
	public List<Map<String, Object>> getWorkInstruction() {
		
		// 가공/표면처리/조립
		// 처음 공정인 가공이 insert 되고
		// 가공 품질검사 시작 => lot 공정 이력 인서트
		// 가공 검사완료 => 작업지시 테이블 공정 표면처리로 update
		// 표면처리 품질검사 시작 => lot 공정 이력 인서트
		// 표면처리 검사 완료 => 작업지시 테이블 공정 조립으로 update
		// 조립 품질검사 시작 =>  lot 공정 이력 인서트
		// 조립 검사 완료 => 공정 상태 완료
		
		
		List<Map<String, Object>> list = wiMapper.selectWorkInstruction();
		
		return list;
	}
	
}
