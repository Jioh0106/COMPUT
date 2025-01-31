package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Controller
@RequiredArgsConstructor
@Log
public class ProductController {
	
	
	@GetMapping("/product-info")
	public String productInfo() {
		// http://localhost:8082/product-info
		return"info/product_info";
	}
	
	//팝업창
	@GetMapping("/bom-info")
	public String bomInfo(@RequestParam("productNo") String productNo, 
						  @RequestParam("productName") String productName,
						  Model model) {
		model.addAttribute("productNo", productNo);
		model.addAttribute("productName", productName);
		return"info/bom_info";
	}

}
