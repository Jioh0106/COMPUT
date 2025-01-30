package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Absence;
import com.deepen.entity.Client;
import com.deepen.entity.Material;

public interface ClientRepository extends JpaRepository<Client, Integer>{

}
