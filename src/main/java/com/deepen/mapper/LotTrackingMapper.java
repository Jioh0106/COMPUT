package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.LotProcessDTO;
import com.deepen.domain.LotQcDTO;

@Mapper
public interface LotTrackingMapper {
    // LOT 마스터 정보 조회
    List<LotMasterDTO> selectLotByWorkOrder(Integer wiNo);
    List<LotMasterDTO> selectLotByProduct(Integer productNo);
    List<LotMasterDTO> selectLotDetail(String lotNo);
    
 // LOT 공정 이력 조회
    List<LotProcessDTO> selectLotProcessHistory(String lotNo);
    
    // LOT 품질검사 이력 조회
    List<LotQcDTO> selectLotQcHistory(String lotNo);
    
    // BOM 기반 LOT 계층 구조 조회
//    List<LotHierarchyDTO> selectLotHierarchy(String lotNo);
}
