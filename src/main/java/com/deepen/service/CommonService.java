package com.deepen.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.deepen.domain.CommonDTO;
import com.deepen.mapper.CommonMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class CommonService {

	private final CommonMapper mapper;

	public List<Map<String, Object>> commonList(Map<String, Object> map) {
		return mapper.commonList(map);
	}

	public List<Map<String, Object>> commonDtlList(Map<String, Object> map) {
		return mapper.commonDtlList(map);
	}

	public int saveData(List<CommonDTO> commonList) {

		int result = 0;

		// stream 사용해서 가져오는 List에 tableSe가 parent인지 찾기
		Optional<CommonDTO> parent = commonList.stream().filter(x -> x.getTableSe().equals("parent")).findAny();

		for (CommonDTO common : commonList) {

			if (common.getAction().equals("insert")) {
				if (common.getTableSe().equals("parent")) {
					result = mapper.insertCommonList(common);
				} else {
					result = mapper.insertDetailList(common);
				}

			} else {
				if (common.getTableSe().equals("parent")) {
					result = mapper.updateCommonList(common);
				} else {
					result = mapper.updateDetailList(common);
				}
			}

		}

		return result;
	}

}
