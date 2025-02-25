package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.PlansDTO;
import com.deepen.domain.SaleDTO;


@Mapper
@Repository
public interface PlansMapper {

	List<PlansDTO> getPlanList();

	List<SaleDTO> getRegPlanList();

	List<Map<String, Object>> getUseBoMList(int product_no);

	int sumProcessTime(String string);

	List<Map<String, Object>> getInventorty();

	List<Map<String, Object>> getPlanBomList();

	void savePlan(PlansDTO plan);

	String getPlanOrderId(String order_id);

	List<PlansDTO> getPlanFilterList(String checked_values);

	
	

	




	
	

	
	

	

	
}
	