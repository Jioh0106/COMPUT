package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;


@Mapper
@Repository
public interface WorkInstructionMapper {
	
	// 작업 담당자 조회(생산부)
	List<Map<String, Object>> selectWorkerInfoListByPosition();
	
	// select 박스에 넣을 공정 정보
	List<ProcessInfoDTO> selectProcessInfo();
	
	// select 박스에 넣을 라인 정보
	List<LineInfoDTO> selectLineInfo();
	
	// 작업지시등록을 위한 정보
	List<Map<String, Object>> selectRegWorkInstruction();
	
	//계획번호에 해당하는 품목 조회(반재품을 분리시켜서 조회)
	List<Map<String, Object>> selectPlanItemsWithSeparatedSemiProducts(Map<String, Object> insertList);
	
	// 계획에서 가져온 작업지시정보 insert
	void insertWorkInstruction(Map<String, Object> insertData);
	
	// 작업계획 상태 변경('PRGR005'== 대기중)
	void updatePlanStatus(Map<String, Object> selectData);
	
	//상품번호로 공정 정보 조회
	String selectDeduplicateProcessesName(int productNo);
	
	String selectDeduplicateProcessesNo(int productNo);
	
	// 작업지시 테이블 정보 조회
	List<Map<String, Object>> selectWorkInstruction();
	
	// 작업지시 테이블 정보 조회(where =  작업 지시 번호)
	Map<String, Object> selectWorkInstructionByWiNo(int wiNo);
	
	//품목번호에 해당하는 자재 조회
	List<Map<String, Object>> selectMaterialsByProductNo(String productNo);
	
	// 필요 자제 창고 테이블에 insert
	void insertMaterialInWareHouse(Map<String, Object> insertData);
	
	// 작업시작 정보 update
	void updateWorkStartInfo(Map<String, Object> updateData);
	
	// 작업계획 상태 변경('PRGR002'== 생산중)
	void updatePlanStatusStart(Map<String, Object> updateData);
	
	// 공정 lot_no 조회(where = 작업 지시 번호) 
	List<Map<String, Object>> selectProcessLotNoByWiNo(int wiNo);
	
	// 공정 lot 순차 순번 select
	Integer getLastLotSequence();
	
	// 공정 lot_log 테이블 insert
	void insertProcessLot(Map<String, Object> lotData);
	
	
}
