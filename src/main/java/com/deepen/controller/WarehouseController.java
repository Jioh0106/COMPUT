package com.deepen.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.deepen.entity.Warehouse;
import com.deepen.service.WarehouseService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class WarehouseController {
	
	  /** 창고 서비스 */
    private final WarehouseService service;
    
    @GetMapping("/warehouse")
    public String warehouse(Model model) {
        List<Warehouse> warehouseList = service.warehouseList();
        model.addAttribute("warehouseList", warehouseList);
        System.err.println(warehouseList);
        return "info/warehouse_info";
    }
	
	

}