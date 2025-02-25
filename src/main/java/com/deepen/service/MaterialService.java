package com.deepen.service;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.domain.MaterialDTO;
import com.deepen.entity.Material;
import com.deepen.mapper.MaterialMapper;
import com.deepen.repository.CommonDetailRepository;
import com.deepen.repository.MaterialRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@RequiredArgsConstructor
@Service
public class MaterialService {
	
	/** 자재 레포지토리 **/
	private final MaterialRepository repository;
	private final MaterialMapper mappr;
	private final CommonDetailRepository cdRepository;
	
	/** 자재 목록 조회 **/
	public List<MaterialDTO> getMaterialList() {
		return mappr.getMaterialList();
	}
	
	/** 자재 항목 추가 **/
	public void insertMaterial(List<MaterialDTO> createdRows) {
		for(MaterialDTO row : createdRows) {
			Material material = Material.setMaterialToEntity(row);
			material.setMtr_no(null);
			material.setMtr_unit(cdRepository.findCommonDetailCodeByName(row.getUnit_name()));
			repository.save(material);
		}
	}

	/** 자재 항목 수정 **/
	public void updateMaterial(List<MaterialDTO> updatedRows) {
		for(MaterialDTO row : updatedRows) {
			Material material = Material.setMaterialToEntity(row);
			material.setMtr_mod_data(new Date(System.currentTimeMillis()));
			material.setMtr_unit(cdRepository.findCommonDetailCodeByName(row.getUnit_name()));
			repository.save(material);
		}
	}
	
	/** 자재 항목 삭제 **/
	public void deleteMaterial(List<Integer> deleteList) {
		repository.deleteAllById(deleteList);
	}


	
} // MaterialService
