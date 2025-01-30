package com.deepen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.entity.Material;
import com.deepen.repository.MaterialRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@RequiredArgsConstructor
@Service
public class MaterialService {
	
	private final MaterialRepository repository;
		
	public List<Material> materialList() {
		return repository.findAll();
	}
	
	
	public void deleteMaterial(List<Integer> deleteList) {
		repository.deleteAllById(deleteList);
	}


	public void insertMaterial(List<Material> createdRows) {
		for(Material row : createdRows) {
			row.setMtr_no(null);
			repository.save(row);
		}
	}

	
	public void updateMaterial(List<Material> updatedRows) {
		for(Material row : updatedRows) {
			repository.save(row);
		}
	}
	
	
} // MaterialService
