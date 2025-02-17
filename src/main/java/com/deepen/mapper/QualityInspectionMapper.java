//package com.deepen.mapper;
//
//import java.util.List;
//import org.apache.ibatis.annotations.Mapper;
//import org.apache.ibatis.annotations.Param;
//import com.deepen.domain.QualityInspectionDTO;
//import com.deepen.domain.LotMasterDTO;
//import com.deepen.domain.ProcessInfoDTO;
//import com.deepen.domain.QcMasterDTO;
//import com.deepen.domain.QcProductMappingDTO;
//
//@Mapper
//public interface QualityInspectionMapper {
//    void insertQualityInspection(QualityInspectionDTO qualityInspectionDTO);
//    List<QualityInspectionDTO> selectQualityInspectionByLotNo(String lotNo);
//    LotMasterDTO selectLotMasterByNo(String lotNo);
//    void updateLotMaster(LotMasterDTO lotMasterDTO);
//    List<ProcessInfoDTO> selectAllProcessInfo();
//    List<QcMasterDTO> selectQcMasterByProcess(Integer processNo);
//    List<QcProductMappingDTO> selectQcProductMappingByQcCode(String qcCode);
//
//    // 새로 추가된 메서드들
//    List<LotMasterDTO> selectInspectionLots(
//        @Param("lotNo") String lotNo, 
//        @Param("wiNo") Integer wiNo, 
//        @Param("processNo") Integer processNo
//    );
//
//    List<QcProductMappingDTO> selectQcProductMappingByProductAndProcess(
//        @Param("productNo") Integer productNo, 
//        @Param("processNo") Integer processNo
//    );
//    void updateLotStatusAndResult(
//    	@Param("lotNo") String lotNo, 
//        @Param("status") String status
//    );
//    
//    void insertLotMaster(LotMasterDTO lotMaster);
//
//    LotMasterDTO getLotMasterByLotNo(String lotNo);
//
//    void insertLotRelationship(
//        @Param("parentLotNo") String parentLotNo,
//        @Param("childLotNo") String childLotNo
//    );
//}
package com.deepen.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.deepen.domain.InspectionHistoryDTO;
import com.deepen.domain.InspectionSearchDTO;
import com.deepen.domain.InspectionStatsDTO;
import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.ProcessInfoDTO;
import com.deepen.domain.QcProductMappingDTO;
import com.deepen.domain.QualityInspectionDTO;

@Mapper
public interface QualityInspectionMapper {
    
    // LOT 관련 쿼리
    List<LotMasterDTO> selectInspectionLots(
        @Param("lotNo") String lotNo,
        @Param("wiNo") Integer wiNo,
        @Param("processNo") Integer processNo
    );
    
    LotMasterDTO selectLotMasterByNo(String lotNo);
    
    void insertLotMaster(LotMasterDTO lotMaster);
    
    void updateLotStatusAndResult(
        @Param("lotNo") String lotNo,
        @Param("status") String status
    );
    
    // LOT 관계 관련 쿼리
    void insertLotRelationship(
        @Param("parentLotNo") String parentLotNo,
        @Param("childLotNo") String childLotNo
    );
    
    // 검사 항목 관련 쿼리
    List<QcProductMappingDTO> selectQcProductMappingByProductAndProcess(
        @Param("productNo") Integer productNo,
        @Param("processNo") Integer processNo
    );
    
    // 검사 결과 관련 쿼리
    void insertQualityInspection(QualityInspectionDTO qualityInspectionDTO);
    
    List<QualityInspectionDTO> selectQualityInspectionByLotNo(String lotNo);
    
    // 공정 관련 쿼리
    List<ProcessInfoDTO> selectAllProcessInfo();
    
    ProcessInfoDTO selectNextProcess(Integer currentProcessNo);

	List<QualityInspectionDTO> selectInspectionHistory(String lotNo, String fromDate, String toDate, Integer processNo, String judgement);
	
	// 검사 이력 조회
    List<InspectionHistoryDTO> selectInspectionHistory(InspectionSearchDTO search);
    
    // 통계 정보 조회
    List<InspectionStatsDTO> selectInspectionStats(
        @Param("fromDate") String fromDate,
        @Param("toDate") String toDate,
        @Param("processNo") Integer processNo
    );
}