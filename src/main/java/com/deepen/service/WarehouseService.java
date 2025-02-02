package com.deepen.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import com.deepen.entity.Warehouse;
import com.deepen.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class WarehouseService {
	
	 /** 창고 레포지토리 **/
    private final WarehouseRepository repository;
    
    /** 창고 목록 조회 **/
    public List<Warehouse> warehouseList() {
        return repository.findAll();
    }
    
    /** 창고 항목 추가 **/
    public void insertWarehouse(List<Warehouse> createdRows) {
        for(Warehouse row : createdRows) {
            row.setReg_date(LocalDate.now());
            row.setStatus("미사용");
            repository.save(row);
        }
    }

    /** 창고 항목 수정 **/
    public void updateWarehouse(List<Warehouse> updatedRows) {
        for(Warehouse row : updatedRows) {
            row.setMod_date(LocalDate.now());
            repository.save(row);
        }
    }
    
    /** 창고 항목 삭제 **/
    public void deleteWarehouse(List<String> deleteList) {
        repository.deleteAllById(deleteList);
    }
} 



