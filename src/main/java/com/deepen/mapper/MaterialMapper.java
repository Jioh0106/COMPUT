package com.deepen.mapper;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.MaterialDTO;


@Mapper
@Repository
public interface MaterialMapper {

	List<MaterialDTO> getMaterialList();

	

}