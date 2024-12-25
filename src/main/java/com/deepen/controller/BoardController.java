package com.deepen.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deepen.domain.BoardDTO;
import com.deepen.entity.Board;
import com.deepen.service.BoardService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class BoardController {
	
	private final BoardService boardService;
	
	// application에 설정해 둔 파일 위치 가져오기
	// uploadPath=D:/workspace_sts4/springboot/src/main/resources/static/upload
	@Value("${uploadPath}")
	String uploadPath;
	
	
	
	
	// 글 작성하기 뷰로
	@GetMapping("boardWrite")
	public String boardWrite(HttpSession session){
		String id = (String)session.getAttribute("id");
		if(id == null) {
			return "/member/login";
		}
		return "/board/write";
		
	}
	
	// 글 작성하기 작업
	@PostMapping("boardWrite")
	public String boardWritePro(BoardDTO board){
		boardService.save(board);
		
		return "redirect:/boardList";
	}
	
	@GetMapping("boardList")
	public String boardList(Model model) {
		
		List<Board> boardList = boardService.findAll();
		model.addAttribute("boardList", boardList);
		
		return "/board/board_list";
	}
	
	
	// 글 상세보기
	@GetMapping("boardDetail")
	public String boardDetail(@RequestParam("board_num") int board_num, Model model){
		
		Optional<Board> board = boardService.findById(board_num);
		
		model.addAttribute("board", board.get());
		log.info(board.get().toString());
		
		return "/board/detail";
	}
	
	// 글 수정하기 뷰로
	@GetMapping("boardUpdate")
	public String boardUpdate(@RequestParam("board_num") int board_num, Model model){
		Optional<Board> board = boardService.findById(board_num);
		
		model.addAttribute("board", board.get());
		log.info(board.get().toString());
		
		return "/board/update";
	}
	
	// 글 수정 작업
	@PostMapping("boardUpdate")
	public String boardUpdatePro(Model model, BoardDTO board) {
		
		boardService.saveUpdate(board);
		
		return "redirect:/boardDetail?board_num="+board.getBoard_num();
		
	}
	
	// 글 삭제하기
	@GetMapping("boardDelete")
	public String boardDelete(@RequestParam("board_num") int board_num){
		boardService.deleteById(board_num);
		
		return "redirect:/boardList";
	}
	
	
	
	
	
} // BoardController
