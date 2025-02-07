package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

}
