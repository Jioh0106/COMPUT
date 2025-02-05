package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import com.deepen.domain.LineInfoDTO;
import com.deepen.domain.ProcessInfoDTO;


@Mapper
@Repository
public interface WorkInstructionMapper {
	
	// 작업 담당자 조회(생산부)
	List<Map<String, Object>> selectWokerInfoListByPosition();
	
	// select 박스에 넣을 공정 정보
	List<ProcessInfoDTO> selectProcessInfo();
	
	// select 박스에 넣을 라인 정보
	List<LineInfoDTO> selectLineInfo();
}
