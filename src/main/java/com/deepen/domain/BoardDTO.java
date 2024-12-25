package com.deepen.domain;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class BoardDTO {
	private int board_num;
	private String writer;
	private String title;	
	private String content;	
	private int readcount;	
	private Timestamp write_date;

}
