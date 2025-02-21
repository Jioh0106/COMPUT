package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.deepen.domain.BuyDTO;
import com.deepen.domain.ClientDTO;
import com.deepen.domain.MaterialDTO;
import com.deepen.domain.OrdersDTO;
import com.deepen.domain.ProductDTO;
import com.deepen.domain.SaleDTO;


@Mapper
@Repository
public interface OrdersMapper {

	List<OrdersDTO> getOrdersList();
	
	List<OrdersDTO> getOrderSerchList(Map<String, String> map);
	
	List<ClientDTO> getClientSerch(String type);

	List<ProductDTO> getPrdctSerch();

	List<MaterialDTO> getMtrSerch();

	void insertOrders(OrdersDTO order);

	void insertSale(SaleDTO sale);

	void insertBuy(BuyDTO buy);

	List<SaleDTO> getDetailSale(@Param("order_id") String order_id);

	List<BuyDTO> getDetailBuy(@Param("order_id") String order_id);

	void insertInbound(Map<String, Object> inbound);

	List<Map<String, Object>> getgetBomList(int product_no);

	String checkIsClient(@Param("client_no")int client_no, @Param("order_type") String order_type);

	void updateOrder(String order_id);




	




	
	

	
	

	

	
}
	