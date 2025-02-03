package com.deepen.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepen.domain.BomDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.service.ProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/product")
@Log
public class ProductRestController {
	
	private final ProductService pdService;
	
	
	//상품테이블 저장
	@PostMapping("/save")
	public ResponseEntity<ProductDTO> saveProduct(@RequestBody ProductDTO productDto){
		
		Integer productNo = pdService.saveProduct(productDto);
		log.info("상품번호"+productNo);
		productDto.setProduct_no(productNo);
		
		return ResponseEntity.ok(productDto); //저장된 상품정보 반환
	}
	
	//상품그리드 조회
	@PostMapping("/list")
	public ResponseEntity<List<Map<String, Object>>> findProducts(@RequestBody Map<String, String> params) {
		 String productName = params.get("productName");
		 String searchMonth = params.get("searchMonth");

		 List<Map<String, Object>> products = pdService.listProduct(productName, searchMonth);

		 return ResponseEntity.ok(products);
	}
	
	//팝업창 자재,상품 조회
	@GetMapping("/mtrlist")
	public ResponseEntity<List<Map<String, Object>>> mtrAndProduct (
			@RequestParam(value = "item_name", required = false) String item_name){
		List<Map<String, Object>> data = pdService.mtrAndProduct(item_name);
		
		return ResponseEntity.ok(data);
	}
	
	//BOM테이블 등록
	@PostMapping("/bom/insert")
	public ResponseEntity<String> bomInsert(@RequestBody List<BomDTO> items){
		pdService.bomInsert(items);
		return ResponseEntity.ok("bom테이블 insert완료");
	}
	
	//BOM그리드 조회
	@GetMapping("/bom/list")
	public ResponseEntity<List<BomDTO>>listBom(@RequestParam("product_no") Integer productNo){
		log.info("상품번호 :" + productNo);
	    List<BomDTO> bomData =  pdService.listBom(productNo);
		return ResponseEntity.ok(bomData);
	}
	
	//BOM 하위그리드 삭제
	@PostMapping("/delete/row")
	public ResponseEntity<String> deleteRows(@RequestBody List<Integer> no) {
        try {
            pdService.deleteRow(no);
            return ResponseEntity.ok("삭제가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생: " + e.getMessage());
        }
    } 
	
	//BOM 상위그리드 삭제
	@PostMapping("/delete/row/product")
	public ResponseEntity<String> deleteRowsProduct(@RequestBody List<Integer> no) {
		try {
			pdService.deleteRowProduct(no);
			return ResponseEntity.ok("삭제가 완료되었습니다.");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생: " + e.getMessage());
		}
	} 

	
	
	//BOM 그리드 select 박스 공정 조회
	@GetMapping("/select/process")
	public ResponseEntity<List<Map<String, Object>>> selectProcess(){
		List<Map<String, Object>> processList = pdService.selectProcess();
		log.info("공정유형 : " + processList);
		return ResponseEntity.ok(processList);
	}
	
	
	//BOM 테이블 업데이트
	@PostMapping("/bom/update")
	public ResponseEntity<String> updateBom(@RequestBody List<BomDTO> items) {
	    pdService.updateBom(items); // 서비스에서 UPDATE 처리
	    return ResponseEntity.ok("BOM 데이터 업데이트 완료");
	}
	
	//단위 공통코드 조회
	@GetMapping("/select/unit")
	public List<CommonDetailDTO> selectunit(){
		List<CommonDetailDTO> unitList = pdService.selectUnit();
		return unitList;
	}
	
	
	
}
