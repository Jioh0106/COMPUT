package com.deepen.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.entity.Employees;
import com.deepen.entity.WorkTmp;
import com.deepen.mapper.WorkMapper;
import com.deepen.repository.PersonnelRepository;
import com.deepen.repository.WorkTmpRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Service
@Log
public class WorkService {
	
	private final PersonnelRepository personnelRepository;
	private final WorkTmpRepository workTmpRepository;
	private final WorkMapper workMapper;
	
	public Optional<Employees> findById(String emp_id) {
		return personnelRepository.findById(emp_id);
	}

	public List<WorkTmp> findAll() {
		return workTmpRepository.findAll();
	}

	public List<Map<String, String>> getEmpSerch(Map<String, String> serchEmpInfo) {
		
		
		return workMapper.getEmpSerch(serchEmpInfo);
	}

	public void insertWork(String tmp, List<Map<String, Object>> selectedRows) {
		// TODO Auto-generated method stub
		
	}

}



