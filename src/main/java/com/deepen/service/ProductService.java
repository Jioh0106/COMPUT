package com.deepen.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.BomDTO;
import com.deepen.domain.CommonDetailDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.entity.Bom;
import com.deepen.entity.Product;
import com.deepen.mapper.ProductMapper;
import com.deepen.repository.BomRepository;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class ProductService {
	
	private final CommonDetailRepository cdRepository;
	private final ProductRepository pdRepository;
	private final ProductMapper pdMapper;
	private final BomRepository bomRepository;
	
	//상품등록
	public Integer saveProduct (ProductDTO productDto) {
		
		Product product = new Product();
		product.setProduct_name(productDto.getProduct_name());
		product.setProduct_unit(productDto.getProduct_unit());
		product.setProduct_type(productDto.getProduct_type());
		product.setProduct_date(LocalDateTime.now());
		
		pdRepository.save(product);
		log.info("생성된 상품 번호 "+ product.getProduct_no());
		
		return product.getProduct_no();
	}
	
	
	//상품 리스트
	public List<Map<String, Object>> listProduct(String productName, String searchMonth) {
        
		Map<String, Object> params = new HashMap<>();
        params.put("productName", productName);
        params.put("searchMonth", searchMonth);

        return pdMapper.listProduct(params);
    }
	
	//자재+상품 리스트
	public List<Map<String, Object>> mtrAndProduct(String item_name){
		
		return pdMapper.mtrAndProduct(item_name);
	}
	
	//BOM테이블 insert
	public void bomInsert(List<BomDTO> items) {
		
		for(BomDTO bomDto : items) {
			Bom bom = new Bom();
			
			bom.setBom_unit(bomDto.getItemUnit());
			bom.setProduct_no(bomDto.getProductNo());
			bom.setBom_date(LocalDateTime.now());
			
			if(bomDto.getItemType().equals("반제품")) {
				bom.setMtrproduct_no(bomDto.getItemNo());
			}else if(bomDto.getItemType().equals("자재")) {
				bom.setMtr_no(bomDto.getItemNo());
			}
			bomRepository.save(bom);
		}
		
	}
	
	//하위그리드 조회
	public List<BomDTO> listBom(Integer productNo) {
		List<BomDTO> bom = pdMapper.listBom(productNo);
		return bom;
	}
	
	//하위그리드 체크박스 삭제
	 public void deleteRow(List<Integer> no) {
        if (no == null || no.isEmpty()) {
            throw new IllegalArgumentException("삭제할 ID 목록이 비어 있습니다.");
        }
        pdMapper.deleteRow(no);
    }
	 
	 //상위그리드 체크박스 삭제
	 public void deleteRowProduct(List<Integer> no) {
		 if (no == null || no.isEmpty()) {
			 throw new IllegalArgumentException("삭제할 ID 목록이 비어 있습니다.");
		 }
		 pdMapper.deleteRowProduct(no);
	 }


	//BOM 공정 컬럼 select 박스 조회
	public List<Map<String, Object>> selectProcess() {
		return pdMapper.selectProcess();
	}
	 
	//BOM 테이블 업데이트(공정, 소모량, 상태, 등록일) 
//	public void updateBom(List<BomDTO> items) {
//		for(BomDTO bomDto : items) {
//			Optional<Bom> bomNo = bomRepository.findById(bomDto.getBom_no());
//			
//			log.info("업데이트 bom번호 "+bomDto.getBom_no());
//			log.info("업데이트 값들 : "+ bomDto);
//			if(bomNo.isPresent()) {
//				Bom bom = bomNo.get();
//				bom.setBom_status(bomDto.getBom_status());
//				bom.setProcess_name(bomDto.getProcess_name());
//				bom.setBom_quantity(bomDto.getBom_quantity());
//				bom.setBom_date(LocalDateTime.now());
//				bomRepository.save(bom);
//			}
//		}
//	} 
	
	  //BOM, 상품테이블 업데이트
	  public void updateAll(Map<String, Object> requestData) {
        try {
            // 1. 상품 데이터 업데이트
        	 List<Map<String, Object>> productList = (List<Map<String, Object>>) requestData.get("product");
        	 
        	 if (productList != null) {
                 for (Map<String, Object> productMap : productList) {
                	 String productUnitName = productMap.get("product_unit").toString();
                     String unit = cdRepository.findCommonDetailCodeByName(productUnitName);
                     log.info("유닛값!!"+unit);
                     Integer productNo = Integer.parseInt(productMap.get("product_no").toString());
                     Optional<Product> productOpt = pdRepository.findById(productNo);

                     if (productOpt.isPresent()) {
                         Product product = productOpt.get();
                         product.setProduct_name(productMap.get("product_name").toString());
                         product.setProduct_type(productMap.get("product_type").toString());
                         product.setProduct_unit(unit);
                         product.setProduct_date(LocalDateTime.now());
                         pdRepository.save(product);
                         log.info("상품 업데이트 완료: " + productNo);
                     } 
                 }
             }
        	 
            // 2. BOM 데이터 업데이트
            List<Map<String, Object>> bomList = (List<Map<String, Object>>) requestData.get("bomList");
            if (bomList != null) {
                for (Map<String, Object> bomMap : bomList) {
                    Integer bomNo = Integer.parseInt(bomMap.get("bom_no").toString());
                    Optional<Bom> bomOpt = bomRepository.findById(bomNo);

                    if (bomOpt.isPresent()) {
                        Bom bom = bomOpt.get();
                        bom.setBom_status(bomMap.get("bom_status").toString());
                        bom.setProcess_name(bomMap.get("process_name").toString());
                        bom.setBom_quantity(Integer.parseInt(bomMap.get("bom_quantity").toString()));
                        bom.setBom_date(LocalDateTime.now());
                        bomRepository.save(bom);
                        log.info("BOM 업데이트 완료: " + bomNo);
                    }
                }
            }
        } catch (Exception e) {
            log.info("업데이트 오류 발생:"+ e.toString());
            throw new RuntimeException("상품 및 BOM 업데이트 중 오류 발생");
        }
    }
	
	//단위 공통코드 조회
	public List<CommonDetailDTO> selectUnit(){
		List<CommonDetailDTO> unitList = pdMapper.selectUnit();
		return unitList;
	}
	
	
	
	
	
	
	
	
}
