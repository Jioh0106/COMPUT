package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Orders;

public interface OrdersRepository extends JpaRepository<Orders, String>{

}
