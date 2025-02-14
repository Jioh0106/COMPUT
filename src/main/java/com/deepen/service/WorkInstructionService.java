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
	public void regWorkInstruction(List<Map<String, Object>> insertList, String empId) {
		log.info(insertList.toString());
		
		// 계획에서 가져오는 품목에서 반재품을 분리 시켜서 insert를 한다
		for(Map<String, Object> selectData : insertList) {
		// 1. 계획번호에 해당하는 품목 조회(반재품을 분리시켜서 조회)
			List<Map<String, Object>> selectList = wiMapper.selectPlanItemsWithSeparatedSemiProducts(selectData);
			log.info("조회 데이터 : "+selectList.toString());
			
			for(Map<String, Object> insertData : selectList) {
				
				// 2. 분리 시킨 내용 작업지시 테이블에 insert
				// 중복 제거된 공정번호와 공정이름 가져오기
				String processesNo = getDeduplicateProcessesNameByProductNo(insertData);
				String processName = getDeduplicateProcessesNameByProductName(insertData);
				// insertData에 추가
			    insertData.put("PROCESS_NO", processesNo);
			    insertData.put("PROCESS_NAME", processName);
			    //insertData.put("EMP_ID", empId);
			    log.info("인서트 데이터 : "+insertData.toString());
				wiMapper.insertWorkInstruction(insertData);
				
			}
			// 계획상태 대기중(PRGR005)으로 update
			wiMapper.updatePlanStatus(selectData);
			
		}
	}
	
	
	/**
	 * 계획번호에서 상품번호 추출 후
	 * 추출한 상품번호에 해당하는 공정이름 조회 (=> 중복값 처리) 
	 * @return processesName => 가공/조립
	 */
	private String getDeduplicateProcessesNameByProductNo(Map<String, Object> insertData) {
		// 상품번호 가져오기
	    Object productNoObj = insertData.get("PRODUCT_NO");
	    if (productNoObj == null) {
	        log.warning("상품번호가 존재하지 않음");
	    }
	    
	    int productNo = Integer.parseInt(productNoObj.toString());
	    
	    // 상품번호로 공정 정보 조회
	    String processesNo = wiMapper.selectDeduplicateProcessesNo(productNo);
	    log.info("공정 번호 : "+processesNo);
	    
	    return processesNo;
	}
	
	private String getDeduplicateProcessesNameByProductName(Map<String, Object> insertData) {
		// 상품번호 가져오기
	    Object productNoObj = insertData.get("PRODUCT_NO");
	    if (productNoObj == null) {
	        log.warning("상품번호가 존재하지 않음");
	    }
	    
	    int productNo = Integer.parseInt(productNoObj.toString());
	    
	    // 상품번호로 공정 정보 조회
	    String processesName = wiMapper.selectDeduplicateProcessesName(productNo);
	    log.info("공정 이름 : "+processesName);
	    
	    return processesName;
	}
	
	// 작업 지시 정보 조회
	public List<Map<String, Object>> getWorkInstruction() {
		
		List<Map<String, Object>> selectList = wiMapper.selectWorkInstruction();
		
		return selectList;
	}
	
	// 품목에 해당하는 자재 필요 수량 정보 조회
	public List<Map<String, Object>> getMaterialsByProductNo(String productNo, String vol) {
		
		// 품목번호에 해당하는 자재 조회
		List<Map<String, Object>> materialList = wiMapper.selectMaterialsByProductNo(productNo);
		log.info("품목번호에 해당하는 자재들 : "+materialList.toString());
		
		// 계산된 자재량
		List<Map<String, Object>> materialsList = calculatedMaterials(materialList,vol);
		log.info(materialsList.toString());
		
		return materialsList;
	}
	
	// 자재 수량 계산 메서드
	private List<Map<String, Object>> calculatedMaterials(List<Map<String, Object>> materialList, String vol) {
		int volume = Integer.parseInt(vol);
		for(Map<String, Object> materialData : materialList) {
			
			String qtyStr = (String)materialData.get("qty");
			try {
	            int qty = Integer.parseInt(qtyStr); // 자재 수량을 int로 변환
	            int calculatedQty = qty * volume; // 자재 수량과 vol을 곱한 값
	            
	            log.info("자재 수량: " + qty + ", 곱할 양: " + volume + ", 계산된 자재량: " + calculatedQty);
	            
	            // 계산된 자재량을 다시 materialData에 저장
	            materialData.remove("qty");
	            materialData.put("calculatedQty", calculatedQty); 
	        } catch (NumberFormatException e) {
	            log.warning("수량 계산 오류: " + e.getMessage());
	        }
		}
		
		return materialList;
	}
	
	public void insertMaterialInWareHouse(List<Map<String, Object>> insertMaterialData) {
		//log.info("인서트할 정보 : "+insertMaterialData.toString());
		
		for(Map<String, Object> materialData : insertMaterialData) {
			wiMapper.insertMaterialInWareHouse(materialData);
			log.info("인서트한 정보 : "+materialData.toString());
		}
		
	}
	
	public void startWorkInstruction(List<Map<String, Object>> updateDataList, String empId) {
		log.info("작업시작 정보 : "+updateDataList);
		
		// 작업 시작 정보 update
//		for(Map<String, Object> updateData : updateDataList) {
//			wiMapper.updateWorkStartInfo(updateData);
//		}
		log.info("작업 지시 정보 업데이트 완료");
		
		// 공정 lot insert
		
	}
	
}
