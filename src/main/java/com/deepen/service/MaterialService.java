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
	
	/** 자재 레포지토리 **/
	private final MaterialRepository repository;
	
	/** 자재 목록 조회 **/
	public List<Material> materialList() {
		return repository.findAll();
	}
	
	/** 자재 항목 추가 **/
	public void insertMaterial(List<Material> createdRows) {
		for(Material row : createdRows) {
			row.setMtr_no(null);
			repository.save(row);
		}
	}

	/** 자재 항목 수정 **/
	public void updateMaterial(List<Material> updatedRows) {
		for(Material row : updatedRows) {
			repository.save(row);
		}
	}
	
	/** 자재 항목 삭제 **/
	public void deleteMaterial(List<Integer> deleteList) {
		repository.deleteAllById(deleteList);
	}
	
} // MaterialService
