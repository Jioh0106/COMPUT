package com.deepen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.deepen.entity.CommonDetail;

@Repository
public interface CommonDetailRepository extends JpaRepository<CommonDetail, String> {
    @Query("SELECT c FROM CommonDetail c WHERE c.common_detail_code LIKE :prefix% ORDER BY c.common_detail_code DESC")
    List<CommonDetail> findByCommon_detail_codeStartingWith(@Param("prefix") String prefix);
  
//extends JpaRepository<T(Entity), ID(기본키 형)>
//JpaRepository 지원하는 기본 메서드 제공
//save(Entity) : 엔티티 저장 및 수정
//void delete(Entity) : 엔티티 삭제
//void deleteById(id) : 엔티티 삭제

//count : 엔티티 총 개수 반환
//List<Entity> findAll() : 모든 엔티티 조회
//Entity findById(id) : id(기준키)에 대한 엔티티 조회

//쿼리 메서드 정의
//아이디 비밀번호 조회 : findByIdAndPass(id,pass) => where id = ? and pass = ?
//                findByIdOrPass(id,pass) => where id = ? or pass = ?
//                findByNumBetween() => where num between ? and ?

}
