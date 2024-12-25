package com.deepen.entity;

import java.sql.Timestamp;

import com.deepen.domain.BoardDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "BOARD")
@Data
public class Board {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "board_seq")
	@SequenceGenerator(name = "board_seq", sequenceName = "BOARD_SEQ", allocationSize = 1)
	@Column(name = "board_num")
	private int board_num;
	
	@Column(name = "writer")
	private String writer;
	
	@Column(name = "title")
	private String title;	
	
	@Column(name = "content")
	private String content;	
	
	@Column(name = "readcount")
	private int readcount;	
	
	@Column(name = "write_date")
	private Timestamp write_date;
	
	
	public static Board setBoardEntity(BoardDTO boardDTO) {
		Board board = new Board();
		board.setBoard_num(boardDTO.getBoard_num());
		board.setWriter(boardDTO.getWriter());
		board.setTitle(boardDTO.getTitle());
		board.setContent(boardDTO.getContent());
		board.setReadcount(boardDTO.getReadcount());
		board.setWrite_date(boardDTO.getWrite_date());
		return board;
	}


}
