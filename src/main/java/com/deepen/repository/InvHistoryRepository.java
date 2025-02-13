package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.InvHistory;

public interface InvHistoryRepository extends JpaRepository<InvHistory, Integer> {

}
