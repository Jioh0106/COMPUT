package com.deepen.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.deepen.domain.NoticeDTO;
import com.deepen.service.NoticeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@RequiredArgsConstructor
@Controller
@Log
public class NoticeController {
	
	private final NoticeService noticeService;
	
	//http://localhost:8082/ex
	@GetMapping("/ex")
	public String exPage() {
		return "/ex/component-modal.html";
	}
	
	
	@GetMapping("/notice-list")
	public String noticeMain() {
		
		return "";
	}
	
	@GetMapping("/notice-write")
	public String writeNotice() {
		
		return "notice/notice_write";
	}
	
	@PostMapping("/notice-write")
	public String writeNoticePost(@RequestParam("subject") String subject,
			@RequestParam("content") String content,
			@RequestParam("file") MultipartFile file,
			NoticeDTO noticeDTO) {
		//log.info(subject+", "+content+", "+file);
		log.info(noticeDTO.toString());
		
		return "redirect:/notice-write";
	}
	
	
}
