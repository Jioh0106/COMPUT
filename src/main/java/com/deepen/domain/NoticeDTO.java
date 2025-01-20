package com.deepen.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NoticeDTO {
	private int num;
	private String name;
	private String subject;
	private String content;
	private int readcount;
	private LocalDateTime date;
	private String file;
}
