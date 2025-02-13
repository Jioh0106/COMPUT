package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.deepen.domain.QualityInspectionDTO.LotInspectionDTO;
import com.deepen.domain.QualityInspectionDTO.QcItemDTO;
import com.deepen.domain.QualityInspectionDTO.InspectionResultDTO;

@Mapper
public interface QualityInspectionMapper {
    
    // 검사대상 LOT 조회
    List<LotInspectionDTO> selectInspectionLots(
        @Param("lotNo") String lotNo,
        @Param("wiNo") String wiNo,
        @Param("processNo") Long processNo
    );
    
    // LOT별 검사항목 조회
    List<QcItemDTO> selectQcItems(@Param("lotNo") String lotNo);
    
    // 검사결과 저장
    int insertQcResult(InspectionResultDTO result);
    
    // LOT 상태 업데이트
    int updateLotStatus(
        @Param("lotNo") String lotNo,
        @Param("status") String status,
        @Param("inspector") String inspector
    );
}