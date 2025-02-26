package com.deepen.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
//	@PostMapping("/bom/update")
//	public ResponseEntity<String> updateBom(@RequestBody List<BomDTO> items) {
//	    pdService.updateBom(items); // 서비스에서 UPDATE 처리
//	    return ResponseEntity.ok("BOM 데이터 업데이트 완료");
//	}
	
	
	 @PostMapping("/update/all")
	    public ResponseEntity<String> updateAll(@RequestBody Map<String, Object> requestData) {
	        try {
	            log.info("상품 및 BOM 업데이트 요청: " + requestData);
	            pdService.updateAll(requestData);
	            return ResponseEntity.ok("상품 및 BOM 데이터 업데이트 완료");
	        } catch (Exception e) {
	            log.info("업데이트 실패:"+ e.toString());
	            return ResponseEntity.internalServerError().body("업데이트 실패");
	        }
	    }
	
	
	//단위 공통코드 조회
	@GetMapping("/select/unit")
	public List<CommonDetailDTO> selectunit(){
		List<CommonDetailDTO> unitList = pdService.selectUnit();
		return unitList;
	}
	
	@GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(pdService.getAllProducts());
    }
	
	
	//업로드된 엑셀파일을 다운받아서 saveExcel을 실행하는 메서드
	//@CrossOrigin(origins = "*")
	@PostMapping("/upload")
	public ResponseEntity<String> fileUpload(@RequestParam("file") MultipartFile file ){
		try {
			int insertCount = pdService.saveExcel(file);
			return ResponseEntity.ok(insertCount +"개 성공");
			
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("오류발생" + e.getMessage());
		 
		}
	}
		
	
	//상품등록 엑셀 양식 다운로드
	@GetMapping("/excel/download")
	public ResponseEntity<byte[]> excelDownload() throws IOException{
		Workbook workbook = new XSSFWorkbook();
		Sheet sheet = workbook.createSheet("첫번째 시트"); //첫번째시트
		
		Row headerRow1 = sheet.createRow(0); //첫번째 행
		headerRow1.createCell(0).setCellValue("상품명");
		headerRow1.createCell(1).setCellValue("상품단위(N/kg/ml/L/M/cm/EA/%/box/bundle)");
		headerRow1.createCell(2).setCellValue("상품유형(완제품 또는 반제품으로 입력)");
		
		Row headerRow2 = sheet.createRow(1); //두번째 행
		headerRow2.createCell(0).setCellValue("product_name");
		headerRow2.createCell(1).setCellValue("product_unit");
		headerRow2.createCell(2).setCellValue("product_type");
		
		sheet.autoSizeColumn(0); //상품명 열
		sheet.autoSizeColumn(1); // 상품단위 열
		sheet.autoSizeColumn(2); //상품유형 열
		
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		workbook.write(outputStream);
		workbook.close();
		
		// ByteArrayOutputStream을 byte 배열로 변환
        byte[] excelBytes = outputStream.toByteArray();
		
		HttpHeaders headers = new HttpHeaders();
		headers.setContentDisposition(ContentDisposition.attachment()
				.filename("상품등록_엑셀_양식.xlsx", StandardCharsets.UTF_8)
				.build()
			);
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		
		return ResponseEntity.ok()
				.headers(headers)
				.body(excelBytes);
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
