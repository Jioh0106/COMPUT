package com.deepen.service;

import org.springframework.stereotype.Service;

import com.deepen.repository.InboundRepository;
import com.deepen.repository.OutboundRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class OutboundService {
	
	private final OutboundRepository outboundRepository;
	
	
}