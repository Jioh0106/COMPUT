package com.deepen.service;

import java.sql.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.deepen.entity.Client;
import com.deepen.entity.Material;
import com.deepen.repository.ClientRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@RequiredArgsConstructor
@Service
public class ClientService {
	
	/** 거래처 레포지토리 **/
	private final ClientRepository repository;
	
	/** 거래처 목록 조회 **/
	public List<Client> clientList() {
		return repository.findAll();
	}
	
	/** 거래처 항목 추가 **/
	public void insertClient(List<Client> createdRows) {
		for(Client row : createdRows) {
			row.setClient_no(null);
			repository.save(row);
		}
	}

	/** 거래처 항목 수정 **/
	public void updateClient(List<Client> updatedRows) {
		for(Client row : updatedRows) {
			row.setClient_update(new Date(System.currentTimeMillis()));
			repository.save(row);
		}
	}

	/** 거래처 항목 삭제 **/
	public void deleteClient(List<Integer> deleteList) {
		repository.deleteAllById(deleteList);
	}
	
	
	
	
	
	
}
