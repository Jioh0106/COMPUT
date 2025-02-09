package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.ClientDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;


@Mapper
@Repository
public interface OrdersMapper {

	List<OrdersDTO> getOrdersList();

	List<ClientDTO> getClientSerch(String type);

	List<ProductDTO> getPrdctSerch();

	void insertOrders(OrdersDTO order);

	void insertSale(SaleDTO sale);

	List<Map<String, Object>> getDetailSale(String order_id);

	List<Map<String, Object>> getDetailBuy(String order_id);


	
	

	
	

	

	
}
	