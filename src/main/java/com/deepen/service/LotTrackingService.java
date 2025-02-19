package com.deepen.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.LotProcessDTO;
import com.deepen.domain.LotQcDTO;
import com.deepen.mapper.LotTrackingMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LotTrackingService {
    private final LotTrackingMapper lotTrackingMapper;
    
    public List<LotMasterDTO> getLotTrackingByWorkOrder(Integer wiNo) {
        List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByWorkOrder(wiNo);
        for (LotMasterDTO lot : lotList) {
            lot.setProcessHistory(lotTrackingMapper.selectLotProcessHistory(lot.getLotNo()));
            lot.setQcHistory(lotTrackingMapper.selectLotQcHistory(lot.getLotNo()));
        }
        return lotList;
    }
    
    public List<LotMasterDTO> getLotTrackingByProduct(Integer productNo) {
        log.info("Starting getLotTrackingByProduct with productNo: {}", productNo);
        
        List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByProduct(productNo);
        log.info("Raw query result size: {}", lotList.size());
        
        if (!lotList.isEmpty()) {
            log.info("First lot data: {}", lotList.get(0));
            lotList = lotList.stream()
                .filter(lot -> !"DUMMY".equals(lot.getLotStatus()))
                .collect(Collectors.toList());
            log.info("After filtering, remaining lots: {}", lotList.size());
        } else {
            log.warn("No lots found for product {}", productNo);
        }
        
        return lotList;
    }
    
    public LotMasterDTO getLotTrackingDetail(String lotNo) {
        log.info("Getting LOT detail for lotNo: {}", lotNo);
        
        List<LotMasterDTO> lotHierarchy = lotTrackingMapper.selectLotDetail(lotNo);
        if (lotHierarchy.isEmpty()) {
            log.warn("No LOT found for lotNo: {}", lotNo);
            return null;
        }
        
        LotMasterDTO mainLot = lotHierarchy.get(0);
        
        // 공정 이력 조회
        List<LotProcessDTO> processHistory = lotTrackingMapper.selectLotProcessHistory(lotNo);
        mainLot.setProcessHistory(processHistory);
        log.info("Found {} process history records", processHistory.size());
        
        // 품질검사 이력 조회
        List<LotQcDTO> qcHistory = lotTrackingMapper.selectLotQcHistory(lotNo);
        mainLot.setQcHistory(qcHistory);
        log.info("Found {} QC history records", qcHistory.size());
        
        return mainLot;
    }
}