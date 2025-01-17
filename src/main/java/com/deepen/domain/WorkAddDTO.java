package com.deepen.domain;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class WorkAddDTO {
	
	private List<Map<String, Object>> rows;
	private List<String> weekdays;
	private String tmp;

}
