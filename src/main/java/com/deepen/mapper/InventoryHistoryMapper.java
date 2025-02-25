package com.deepen.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface InventoryHistoryMapper {
	
	//변경사유 공통코드
	List<Map<String, Object>> reasonChangeList();
	
	//특정재고번호 변경이력 조회
	List<Map<String, Object>> historyList(@Param ("inventory_no") Integer inventory_no);
	
	//변경이력 삭제
	void deleteHistory(@Param("historyNoList") List<Integer> historyNoList);
	//=>  <foreach collection="historyNoList" item="history_no" open="(" separator="," close=")">
    //    #{history_no}
	//    </foreach> => @Param("historyNoList")안의 이름과 collection="historyNoList"이름이 같아야함!!
	
	//변경이력 최신수정일자 기준으로 재고현황 테이블 업데이트
	void updateInv(@Param("inventory_no") Integer inventoryNo);
}
