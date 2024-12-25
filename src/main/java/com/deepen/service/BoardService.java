package com.deepen.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.deepen.domain.BoardDTO;
import com.deepen.entity.Board;
import com.deepen.repository.BoardRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Service
@RequiredArgsConstructor
@Log
public class BoardService {
	
	private final BoardRepository boardRepository;
	
	
	// 글 추가하기
	public void save(BoardDTO boardDTO) {
		boardDTO.setReadcount(0);
		boardDTO.setWrite_date(new Timestamp(System.currentTimeMillis()));
		
		Board board = Board.setBoardEntity(boardDTO);
		
		boardRepository.save(board);
	}
	
	
	// 모든 게시글 목록으로 가져오기 
	public List<Board> findAll() {
		return boardRepository.findAll();
	}

	// (페이지 번호)모든 글 목록 가져오기
	public Page<Board> getBoardList(Pageable pageable) {
		return boardRepository.findAll(pageable);
	}

	// 글 번호로 해당 글 정보 모두 가져오기
	public Optional<Board> findById(int board_num) {
		return boardRepository.findById(board_num);
	}

	// 글 번호로 글 삭제하기
	public void deleteById(int board_num) {
		boardRepository.deleteById(board_num);
		
	}
	
	// 글 수정하기
	public void saveUpdate(BoardDTO boardDTO) {
		Board board = Board.setBoardEntity(boardDTO);
		boardRepository.save(board);
	}

	

}

