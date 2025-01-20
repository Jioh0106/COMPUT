package com.deepen.service;

import org.springframework.stereotype.Service;

import com.deepen.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class NoticeService {
	
	private final NoticeRepository noticeRepo;
	
	

}
