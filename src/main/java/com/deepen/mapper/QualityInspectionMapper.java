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
    
    int getNextLotSequence(String date);
    
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
    
    // 검사 이력 조회
    List<InspectionHistoryDTO> selectInspectionHistory(InspectionSearchDTO search);
    
    // 통계 정보 조회
    List<InspectionStatsDTO> selectInspectionStats(
        @Param("fromDate") String fromDate,
        @Param("toDate") String toDate,
        @Param("processNo") Integer processNo
    );
    
    void updateQcLogLotNo(@Param("qcLogNo") Integer qcLogNo, @Param("lotNo") String lotNo);
    
    Integer getNextQcLogNo();
}