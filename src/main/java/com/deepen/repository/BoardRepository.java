package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Integer>{

}
