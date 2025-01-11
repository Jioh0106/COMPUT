package com.deepen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.entity.Request;
import com.deepen.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@Log
@RequiredArgsConstructor // 객체생성
public class RequestService {
	
	private final RequestRepository rqRepository;
	
	
	public List<Request> requestAllList(){
		return rqRepository.findAll();
	}
	
	
}
