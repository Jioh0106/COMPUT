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
		
		// 계획에서 가져오는 품목에서 반재품을 분리 시켜서 insert를 한다
		for(Map<String, Object> selectData : insertList) {
		// 1. 계획번호에 해당하는 품목 조회(반재품을 분리시켜서 조회)
			List<Map<String, Object>> selectList = wiMapper.selectPlanItemsWithSeparatedSemiProducts(selectData);
			log.info("조회 데이터 : "+selectList.toString());
			
			for(Map<String, Object> insertData : selectList) {
				// 2. 분리 시킨 내용 작업지시 테이블에 insert
				log.info("인서트 데이터 : "+insertData.toString());
				//wiMapper.insertWorkInstruction(insertData);
				// 3. 품목에 맞는 공정 작업지시 테이블에 insert
				String processesNo = getDeduplicateProcessesNameByProductNO(insertData);
			}
			// 계획상태 대기중(PRGR005)으로 update
			//wiMapper.updatePlanStatus(selectData);
			
		}
	}
	
	
	/**
	 * 계획번호에서 상품번호 추출 후
	 * 추출한 상품번호에 해당하는 공정이름 조회 (=> 중복값 처리) 
	 * @return processesName => 가공/조립
	 */
	private String getDeduplicateProcessesNameByProductNO(Map<String, Object> insertData) {
		//추출 
		log.info("추출할 기준 정보 : "+insertData);
		log.info("추출 시작");
		// 상품번호 가져오기
	    Object productNoObj = insertData.get("PRODUCT_NO");
	    if (productNoObj == null) {
	        log.warning("상품번호가 존재하지 않음");
	        return null;
	    }
	    
	    int productNo = Integer.parseInt(productNoObj.toString());
	    log.info("상품번호: " + productNo);
	    
	    // 상품번호로 공정 정보 조회
	    String processesNo = wiMapper.selectDeduplicateProcessesNo(productNo);
	    log.info("공정 정보 : "+processesNo);
	    
	    return processesNo;
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
		
		List<Map<String, Object>> selectList = wiMapper.selectWorkInstruction();
		
		return selectList;
	}
	
}
