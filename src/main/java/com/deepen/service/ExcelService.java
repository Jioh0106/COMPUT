package com.deepen.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.deepen.domain.ProductDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class ExcelService {
	
	
	//엑셀파일 읽고 -> DTO 리스트로 변환
	public List<ProductDTO> readexcelfile(MultipartFile file){
		List<ProductDTO> productList = new ArrayList<>();
		
		try(InputStream inputStream = file.getInputStream();
		   Workbook workbook = new XSSFWorkbook(inputStream)){
			
			Sheet sheet = workbook.getSheetAt(0); //첫번째시트를 가져온다.
			Iterator<Row> rowIterator = sheet.iterator(); //첫번째시트에서 행을 들고옴
			
			//첫번째 행 -> 헤더(상품명, 상품단위, 상품유형)는 제외한다.
			if(rowIterator.hasNext()){
				rowIterator.next();
			}
			
			//두번째 행 -> pruduct_name, product_unit, product_type이 적힌 행.
			if(rowIterator.hasNext()){
				rowIterator.next();
			}
			
			
			while(rowIterator.hasNext()) {
				Row row = rowIterator.next();
				ProductDTO productDTO = new ProductDTO();
				
				productDTO.setProduct_name(getCellValue(row.getCell(0))); //상품명
				productDTO.setProduct_unit(getCellValue(row.getCell(1))); //상품단위
				productDTO.setProduct_type(getCellValue(row.getCell(2))); //상품유형(완제품,반제품)
				
				 // 유효한 데이터인지 확인 후 추가
			    if (productDTO.getProduct_name() != null && productDTO.getProduct_type() != null) {
			        productList.add(productDTO);
			        log.info("엑셀 데이터 읽음: " + productDTO.toString());
			    } else {
			        log.info("빈 데이터가 포함된 행이므로 제외됨.");
			    }
				
//				productList.add(productDTO);
//				  log.info("엑셀 데이터 읽음: " + productDTO.toString()); // 추가
			}
			
			
		} catch (IOException e) {
			e.printStackTrace();
			
		}
		
		return productList;
	 }	
	
	
	private String getCellValue(Cell cell) {
		  if (cell == null || cell.getCellType() == CellType.BLANK) {
		        return null;  // 빈 값은 null로 설정
		    }
//	    if (cell == null) {
//	        return null;
//	    }
	    switch (cell.getCellType()) {
	        case STRING:
	            return cell.getStringCellValue();
	        case NUMERIC:
	            return String.valueOf((int) cell.getNumericCellValue()); // 정수 변환
	        case BOOLEAN:
	            return String.valueOf(cell.getBooleanCellValue());
	        case FORMULA:
	            return cell.getCellFormula();
	        case BLANK:
	            return null;
	        default:
	            return null;
	    }
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
}
