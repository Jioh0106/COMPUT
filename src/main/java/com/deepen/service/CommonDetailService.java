package com.deepen.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDetailDTO;
import com.deepen.entity.CommonDetail;
import com.deepen.repository.CommonDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommonDetailService {
    
    private final CommonDetailRepository repository;
    
    public void save(CommonDetailDTO commonDetailDTO) {
        CommonDetail commonDetail = CommonDetail.setCommonDetailEntity(commonDetailDTO);
        repository.save(commonDetail);
    }
    
    public List<CommonDetail> findAll() {
        return repository.findAll();
    }
    
}
