package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Bom;

public interface BomRepository extends JpaRepository<Bom, Integer> {

}
