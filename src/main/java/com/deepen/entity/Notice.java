package com.deepen.entity;

import java.time.LocalDateTime;

import com.deepen.domain.NoticeDTO;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

// 데이터 베이스의 테이블과 같은 개념
// Entity 매핑 관련 어노테이션
// @Entity : 클래스 Entity 선언
// @Table : Entity와 매핑할 테이블 지정
// @Id: 테이블에서 기본키 사용할 속성 지정
// @Column : 필드와 컬럼 매핑
// name = "칼럼명", length=크기, nullable=false, unique,
//         columnDefinition=varchar(5) 직접지정, insertable, updatable
// @GeneratedValue(strategy=GenerationType.AUTO) 키값생성, 자동으로 증가 시 사용
// @Lob BLOB, CLOB 타입 매핑
// @CreateTimestamp insert 시 시간 자동 저장
// @Enumerated enum 타입매핑


@Entity
@Table(name = "notice")
@Data
public class Notice {
	
//	primary key, 글번호 자동으로 1씩 증가, 수정 false
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "num", updatable = false) // 공지사항 글번호
	private int num;
	
	@Column(name = "name")
	private String name;
	
	@Column(name = "subject")
	private String subject;
	
	@Column(name = "content")
	private String content;
	
	@Column(name = "readcount")
	private int readcount;
	
//	오라클 수정
	@Column(name = "dates")
	private LocalDateTime date;
	
//	오라클 수정
	@Column(name = "files")
	private String file;
	
	public static Notice setBoardEntity(NoticeDTO boardDTO) {
		
		Notice board = new Notice();
		board.setNum(boardDTO.getNum());
		board.setName(boardDTO.getName());
		board.setSubject(boardDTO.getSubject());
		board.setContent(boardDTO.getContent());
		board.setReadcount(boardDTO.getReadcount());
		board.setDate(boardDTO.getDate());
		board.setFile(boardDTO.getFile());
		
		return board;
	}
	
}
