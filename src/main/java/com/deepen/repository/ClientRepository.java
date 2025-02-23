package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Client;

public interface ClientRepository extends JpaRepository<Client, Integer>{

}
