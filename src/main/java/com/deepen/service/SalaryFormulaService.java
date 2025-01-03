package com.deepen.service;

import org.springframework.stereotype.Service;

import com.deepen.domain.SalaryFormulaDTO;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.SalaryFormulaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryFormulaService {
	
	private final SalaryFormulaRepository salaryFormulaRepository;
	private final CommonDetailRepository commonDetailRepository;

	public void save(SalaryFormulaDTO formulaDTO) {
		
	}
	
}
