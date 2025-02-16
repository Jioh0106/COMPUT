package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.deepen.domain.InboundDTO;
import com.deepen.service.InboundService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inbound")
@RequiredArgsConstructor
public class InboundRestController {
    
    private final InboundService inboundService;
    
    // 입고조회 
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getInboundList(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false, defaultValue = "대기") String status) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("keyword", keyword);
        params.put("status", status);
        
        List<InboundDTO> inboundList = inboundService.getInboundList(params);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", inboundList);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{inNo}")
    public ResponseEntity<Map<String, Object>> getInbound(@PathVariable("inNo") Integer inNo) {
        InboundDTO inbound = inboundService.getInbound(inNo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", inbound);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    // 품목검색 
    @GetMapping("/search/items")
    public ResponseEntity<List<Map<String, Object>>> searchItems(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        List<Map<String, Object>> items = inboundService.searchItems(keyword);
        return ResponseEntity.ok(items);
    }
    
    // 창고검색
    @GetMapping("/search/warehouses")
    public ResponseEntity<List<Map<String, Object>>> searchWarehouses(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam("itemNo") int itemNo,
            @RequestParam("itemType") String itemType) {
        List<Map<String, Object>> warehouses = inboundService.searchWarehouses(keyword, itemNo, itemType);
        return ResponseEntity.ok(warehouses);
    }
    // 구역
    @GetMapping("/warehouse/{warehouseCode}/zones")
    public ResponseEntity<List<String>> getWarehouseZones(
            @PathVariable("warehouseCode") String warehouseCode,
            @RequestParam("itemNo") int itemNo) {
        List<String> zones = inboundService.getWarehouseZones(warehouseCode, itemNo);
        return ResponseEntity.ok(zones);
    }
    
    // 입고등록
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveInbound(@RequestBody InboundDTO inboundDTO) {
        inboundService.saveInbound(inboundDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "입고 등록이 완료되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    //	입고수정
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateInbound(@RequestBody InboundDTO inboundDTO) {
        inboundService.updateInbound(inboundDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "입고 정보가 수정되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    // 일괄 처리 
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> inNos = request.get("inNos");
        inboundService.bulkDelete(inNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "선택한 입고 정보가 삭제되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    // 일괄 완료
    @PutMapping("/bulk-complete")
    public ResponseEntity<Map<String, Object>> bulkComplete(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> inNos = request.get("inNos");
        inboundService.bulkComplete(inNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "선택한 입고가 완료 처리되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    // 사용자 정보 
    @GetMapping("/user/current")
    public ResponseEntity<Map<String, String>> getCurrentUser() {
        Map<String, String> response = new HashMap<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            response.put("username", auth.getName());
        } else {
            response.put("username", "Unknown User");
        }
        
        return ResponseEntity.ok(response);
    }
}