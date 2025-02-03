package com.deepen.service;

import org.springframework.stereotype.Service;

import com.deepen.repository.InboundRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class InboundService {
	
	private final InboundRepository inboundRepository;
	
	
}