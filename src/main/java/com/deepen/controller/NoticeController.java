package com.deepen.controller;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
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
	
	// 파일위치 가져오기
//	uploadPath = D:/workspace_sts4/springboot/src/main/resources/static/upload
	@Value("${uploadPath}")
	String uploadPath;
	
	//http://localhost:8082/ex
	@GetMapping("/ex")
	public String exPage() {
		return "/ex/component-modal.html";
	}
	
	
	@GetMapping("/notice-list")
	public String noticeMain() {
		
		return "notice/notice_list";
	}
	
	@PostMapping("/notice-write")
	public String writeNoticePost(@RequestParam("subject") String subject,
			@RequestParam("content") String content,
			@RequestParam("file") MultipartFile file) throws IOException {
		log.info(subject+", "+content+", "+file);
		//log.info(noticeDTO.toString());
		
		// 첨부파일 이름
		UUID uuid = UUID.randomUUID();
		String fileName = uuid.toString()+"_"+file.getOriginalFilename();
		
		// 첨부파일 => upload 복사 => 업로드
		FileCopyUtils.copy(file.getBytes(), new File(uploadPath,fileName));
		
		NoticeDTO noticeDTO = new NoticeDTO();
		//noticeDTO.setName(name);
		noticeDTO.setSubject(subject);
		noticeDTO.setContent(content);
		noticeDTO.setFile(fileName);
		
		log.info(noticeDTO.toString());
		
		return "redirect:/notice-list";
	}
	
	
}
