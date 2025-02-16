package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.BomDTO;
import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;


@Mapper
@Repository
public interface PlansMapper {

	List<PlansDTO> getPlanList();

	List<SaleDTO> getRegPlanList();

	List<BomDTO> getUseBoMList(int product_no);
	
	

	




	
	

	
	

	

	
}
	