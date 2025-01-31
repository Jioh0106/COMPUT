package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.BomDTO;


@Mapper
@Repository
public interface ProductMapper {
	
	 List<Map<String, Object>> listProduct(Map<String, Object> params);
	 List<Map<String, Object>> mtrAndProduct(String item_name);
	 List<BomDTO> listBom(@Param("product_no") Integer productNo);
	 void deleteRow(@Param("list") List<Integer> no);
	
}
