package com.deepen.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.OrdersDTO;


@Mapper
@Repository
public interface OrdersMapper {

	List<OrdersDTO> getOrdersList();

	


	
	

	

	
}
	