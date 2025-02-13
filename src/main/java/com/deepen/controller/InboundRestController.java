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
        
        System.out.println(inboundList);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search/items")
    public ResponseEntity<List<Map<String, Object>>> searchItems(
        @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        List<Map<String, Object>> items = inboundService.searchItems(keyword);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/search/warehouses")
    public ResponseEntity<List<Map<String, String>>> searchWarehouses(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        List<Map<String, String>> warehouses = inboundService.searchWarehouses(keyword);
        return ResponseEntity.ok(warehouses);
    }
    
    @GetMapping("/warehouse/{warehouseCode}/zones")
    public ResponseEntity<List<String>> getWarehouseZones(
        @PathVariable("warehouseCode") String warehouseCode) {
        List<String> zones = inboundService.getWarehouseZones(warehouseCode);
        return ResponseEntity.ok(zones);
    }
    
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveInbound(@RequestBody InboundDTO inboundDTO) {
        inboundService.saveInbound(inboundDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "입고 등록이 완료되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> inNos = request.get("inNos");
        inboundService.bulkDelete(inNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "선택한 입고 정보가 삭제되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/bulk-complete")
    public ResponseEntity<Map<String, Object>> bulkComplete(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> inNos = request.get("inNos");
        inboundService.bulkComplete(inNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "선택한 입고가 완료 처리되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateInbound(@RequestBody InboundDTO inboundDTO) {
        inboundService.updateInbound(inboundDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "입고 정보가 수정되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/current")
    public ResponseEntity<Map<String, String>> getCurrentUser() {
        Map<String, String> response = new HashMap<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            response.put("username", auth.getName());  // 로그인한 사용자의 emp_id를 반환
        } else {
            response.put("username", "Unknown User");
        }
        
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
    
}