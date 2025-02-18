package com.deepen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.LotMasterDTO;
import com.deepen.mapper.LotTrackingMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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
        List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByProduct(productNo);
        for (LotMasterDTO lot : lotList) {
            lot.setProcessHistory(lotTrackingMapper.selectLotProcessHistory(lot.getLotNo()));
            lot.setQcHistory(lotTrackingMapper.selectLotQcHistory(lot.getLotNo()));
        }
        return lotList;
    }
    
    public LotMasterDTO getLotTrackingDetail(String lotNo) {
        LotMasterDTO lot = lotTrackingMapper.selectLotDetail(lotNo);
        if (lot != null) {
            lot.setProcessHistory(lotTrackingMapper.selectLotProcessHistory(lotNo));
            lot.setQcHistory(lotTrackingMapper.selectLotQcHistory(lotNo));
        }
        return lot;
    }
}