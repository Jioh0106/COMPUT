package com.deepen.service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
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
				// 중복 제거된 공정번호와 공정이름 가져오기
				String processesNo = getDeduplicateProcessesNameByProductNo(insertData);
				String processName = getDeduplicateProcessesNameByProductName(insertData);
				// insertData에 추가
			    insertData.put("PROCESS_NO", processesNo);
			    insertData.put("PROCESS_NAME", processName);
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
		log.info("계산된 자제들 : "+materialsList.toString());
		
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
	
	public void startWorkInstruction(List<Map<String, Object>> updateDataList, String sessionEmpId) {
		log.info("작업시작 정보 : "+updateDataList);
		
		// 작업 시작 정보 update
//		for(Map<String, Object> updateData : updateDataList) {
//			wiMapper.updateWorkStartInfo(updateData);
//			
//			// 작업 계획 상태 업데이트
//			wiMapper.updatePlanStatusStart(updateData);
//		}
		
		log.info("작업 지시 정보 및 상태 업데이트 완료");
		
		// 공정 lot insert
		//createAndInsertProcessLot(updateDataList,sessionEmpId);
		
		// lot master insert
		createAndInsertLotMaster(updateDataList,sessionEmpId);
		
	}
	
	/**
	 * 공정 lot insert
	 * 공정 lot에 넣을 정보 불러오기
	 * 하나의 작업지시 번호에 여러개의 공정 lot
	 */ 
	private void createAndInsertProcessLot(List<Map<String, Object>> updateDataList, String sessionEmpId) {
		//작업 지시 번호 추출
		int wiNo = (int) updateDataList.get(0).get("wi_no");
		Map<String, Object> selectInfoByWiNo =  wiMapper.selectWorkInstructionByWiNo(wiNo);
		log.info("공정 lot에 넣을 작업 지시 정보 : "+selectInfoByWiNo);
		
		// 공정 lot 테이블이 넣기
		String startDate = selectInfoByWiNo.get("start_date").toString().replace("-", "");
		String processNos = selectInfoByWiNo.get("process_no").toString(); // 공정 번호 문자열
		int vol = Integer.parseInt(selectInfoByWiNo.get("vol").toString()); // 투입 수량
		log.info("오늘 날짜 : "+startDate+", 공정 번호들 : "+processNos+", 투입 수량 : "+vol);
		
		String[] processNoArr = processNos.split("/"); // 공정 번호 분리
		int sequence = 1; // 순차 번호 초기화
		
		for (String processNo : processNoArr) {
	        String lotPrefix = startDate + "-W" + wiNo + "-P" + String.format("%03d", Integer.parseInt(processNo));
	        
	        // 기존 LOT 번호 중 가장 큰 순차번호 가져오기
	        Integer lastSequence = wiMapper.getLastLotSequence();
	        int nextSequence = (lastSequence == null) ? sequence : lastSequence + 1;
	        
	        // 최종 LOT 번호 생성
	        String lotNo = lotPrefix + "-" + nextSequence;
	        log.info("최종 lot : "+lotNo);
	        
	        Map<String, Object> lotData = new HashMap<>();
	        lotData.put("lotNo", lotNo);
	        lotData.put("processNo", processNo);
	        lotData.put("lineNo", selectInfoByWiNo.get("line_no"));
	        lotData.put("vol", vol);
	        lotData.put("createUser", sessionEmpId);
	        lotData.put("wiNo", wiNo);

	        // 공정 LOT 데이터 삽입
	        wiMapper.insertProcessLot(lotData);
	        log.info("공정 LOT 등록 완료: " + lotData);
	        
	        sequence++; // 순차 번호 증가
	    }
	}
	
	/**
	 * lot_master에 insert
	 * lot_master에 넣을 정보 불러오기
	 * 하나의 작업지시 번호에 여러개의 공정 lot
	 */
	private void createAndInsertLotMaster(List<Map<String, Object>> updateDataList, String sessionEmpId) {
		// 작업 지시 번호 추출
		int wiNo = (int) updateDataList.get(0).get("wi_no");
		// 지시 번호에 해당하는 로트 번호 조회
		List<Map<String, Object>> processLotNo = wiMapper.selectProcessLotNoByWiNo(wiNo);
		log.info("지시 번호에 해당하는 로트 번호 : "+processLotNo);
		Map<String, Object> selectInfoByWiNo =  wiMapper.selectWorkInstructionByWiNo(wiNo);
		log.info("lot_master에 넣을 작업 지시 정보 : "+selectInfoByWiNo);
		
		String[] processNos = selectInfoByWiNo.get("process_no").toString().split("/");
	    int productNo = ((Number) selectInfoByWiNo.get("product_no")).intValue();
	    //int productNo = (int)selectInfoByWiNo.get("product_no");
	    int lineNo = ((Number) selectInfoByWiNo.get("line_no")).intValue();
	    //int lineNo = (int)selectInfoByWiNo.get("line_no");
	    String lotStatus = "LTST002"; // 진행중 상태 코드
	    String processType = "PRTP001"; // 공정 유형
	    
	    //java.sql.Date startTime = new java.sql.Date(((Timestamp) selectInfoByWiNo.get("start_date")).getTime());
	    //Timestamp startTime = (Timestamp) selectInfoByWiNo.get("start_date");
	    // 시간 정보까지 포함하는 날짜 및 시간 문자열 생성
	    Timestamp timestamp = (Timestamp) selectInfoByWiNo.get("start_date");
	    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	    String startTimeStr = sdf.format(timestamp);
	    
	    String parentLotNo = null;
	    
	    for (int i = 0; i < processLotNo.size(); i++) {
	        Map<String, Object> lotData = processLotNo.get(i);
	        String lotNo = (String) lotData.get("LOT_NO");
	        int processNo = Integer.parseInt(processNos[i]);
	        
	        Map<String, Object> insertData = new HashMap<>();
	        insertData.put("lotNo", lotNo);
	        insertData.put("parentLotNo", parentLotNo);
	        insertData.put("processType", processType);
	        insertData.put("wiNo", String.valueOf(wiNo));
	        insertData.put("productNo", productNo);
	        insertData.put("processNo", processNo);
	        insertData.put("lineNo", lineNo);
	        insertData.put("lotStatus", lotStatus);
	        insertData.put("startTime", startTimeStr);
	        insertData.put("createUser", sessionEmpId);
	        
//	        if (parentLotNo != null) {
//	            insertData.put("updateUser", sessionEmpId);
//	            insertData.put("updateTime", new Timestamp(System.currentTimeMillis()));
//	        }else {
//	        	insertData.put("updateUser", null);
//	        	insertData.put("updateTime", null);
//	        }
	        log.info("lot_master에 넣을 데이터 : "+insertData.toString());
	        
	        wiMapper.insertLotMaster(insertData);
	        
	        // 현재 LOT 번호를 다음 LOT의 부모로 설정
	        parentLotNo = lotNo;
	    }
		
	    log.info("lot_master insert 완료");
		
	}
	
}
