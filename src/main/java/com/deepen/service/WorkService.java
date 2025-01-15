package com.deepen.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.entity.Employees;
import com.deepen.repository.PersonnelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class WorkService {
	
	private final PersonnelRepository personnelRepository;
	
	public Optional<Employees> findById(String emp_id) {
		return personnelRepository.findById(emp_id);
	}

}



