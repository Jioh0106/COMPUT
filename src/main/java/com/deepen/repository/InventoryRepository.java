package com.deepen.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.deepen.entity.Inventory;

import jakarta.transaction.Transactional;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

	//재고현황 - 실재고량,수정자,수정일 업데이트
	 @Modifying
	 @Transactional
     @Query("UPDATE Inventory i SET i.inventory_count = :inventory_count, i.mod_user = :mod_user, i.mod_date = :mod_date WHERE i.inventory_no = :inventory_no")
     int updateInventory(Integer inventory_no, Integer inventory_count, String mod_user, LocalDateTime mod_date);
	
	
}
