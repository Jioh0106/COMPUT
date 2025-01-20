package com.deepen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deepen.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer> {

}
