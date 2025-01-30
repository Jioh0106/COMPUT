package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Absence;
import com.deepen.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, Integer>{

}
