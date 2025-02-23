package com.deepen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.deepen.domain.OutboundDTO;
import com.deepen.service.OutboundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/outbound")
@Log
public class OutboundRestController {
    
    private final OutboundService outboundService;
    
    // 조회 API
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getOutboundList(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false, defaultValue = "대기") String status,
            @RequestParam(value = "source", required = false) String source) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("keyword", keyword);
        params.put("status", status);
        params.put("source", source);
        
        List<OutboundDTO> outboundList = outboundService.getOutboundList(params);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", outboundList);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{outNo}")
    public ResponseEntity<Map<String, Object>> getOutbound(@PathVariable("outNo") Integer outNo) {
        OutboundDTO outbound = outboundService.getOutbound(outNo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", outbound);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    // 검색 API
    @GetMapping("/search/items")
    public ResponseEntity<List<Map<String, Object>>> searchItems(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        List<Map<String, Object>> items = outboundService.searchItemsWithStock(keyword);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/search/warehouses")
    public ResponseEntity<List<Map<String, Object>>> searchWarehouses(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "itemNo", required = true) Integer itemNo) {
        List<Map<String, Object>> warehouses = outboundService.searchWarehousesWithStock(keyword, itemNo);
        return ResponseEntity.ok(warehouses);
    }
    
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveOutbound(@RequestBody OutboundDTO outboundDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            outboundService.saveOutbound(outboundDTO);
            response.put("success", true);
            response.put("message", "출고 등록이 완료되었습니다.");
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "출고 등록 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateOutbound(@RequestBody OutboundDTO outboundDTO) {
        outboundService.updateOutbound(outboundDTO);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "출고 정보가 수정되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    // 일괄 처리 API
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> outNos = request.get("outNos");
        outboundService.bulkDelete(outNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "선택한 출고 정보가 삭제되었습니다.");
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeOutbound(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> outNos = request.get("outNos");
        outboundService.completeOutbound(outNos);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "출고 완료 처리되었습니다.");
        
        return ResponseEntity.ok(response);
    }
}