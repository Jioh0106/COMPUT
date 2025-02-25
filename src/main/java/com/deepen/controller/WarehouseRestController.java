package com.deepen.controller;


import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.deepen.entity.Warehouse;
import com.deepen.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/warehouse")
@Log
public class WarehouseRestController {
	
	/** 창고 서비스 **/
    private final WarehouseService service;
    
    /** 창고 그리드 정보 저장 **/
    @PostMapping("/save")
    public ResponseEntity<List<Warehouse>> saveWarehouse(@RequestBody Map<String, List<Warehouse>> modifiedRows) {
        List<Warehouse> updatedRows = modifiedRows.get("updatedRows");
        List<Warehouse> createdRows = modifiedRows.get("createdRows");
        
        // 추가 처리
        if (createdRows != null && !createdRows.isEmpty()) {
            service.insertWarehouse(createdRows);
        }
        
        // 업데이트 처리
        if (updatedRows != null && !updatedRows.isEmpty()) {
            service.updateWarehouse(updatedRows);
        }
        
        // 최신 데이터 반환
        List<Warehouse> warehouseList = service.warehouseList();
        return ResponseEntity.ok(warehouseList);
    }
     
    /** 창고 그리드 정보 삭제 **/
    @PostMapping("/delete")
    public ResponseEntity<String> deleteWarehouse(@RequestBody List<String> deleteList) {
        service.deleteWarehouse(deleteList);
        return ResponseEntity.ok("삭제가 완료되었습니다.");
    }
} 