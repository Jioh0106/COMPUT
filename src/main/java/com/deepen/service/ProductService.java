package com.deepen.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.deepen.domain.BomDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.entity.Bom;
import com.deepen.entity.Product;
import com.deepen.mapper.ProductMapper;
import com.deepen.repository.BomRepository;
import com.deepen.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class ProductService {

	private final ProductRepository pdRepository;
	private final ProductMapper pdMapper;
	private final BomRepository bomRepository;
	
	//상품등록
	public Integer saveProduct (ProductDTO productDto) {
		
		Product product = new Product();
		product.setProduct_name(productDto.getProduct_name());
		product.setProduct_unit(productDto.getProduct_unit());
		product.setProduct_price(productDto.getProduct_price());
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
			
			if(bomDto.getItemType().equals("상품")) {
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
	
	//체크박스 삭제
	 public void deleteRow(List<Integer> no) {
        if (no == null || no.isEmpty()) {
            throw new IllegalArgumentException("삭제할 ID 목록이 비어 있습니다.");
        }
        pdMapper.deleteRow(no);
    }
	
	
	 
	 
	 
	 
	 
	 
}
