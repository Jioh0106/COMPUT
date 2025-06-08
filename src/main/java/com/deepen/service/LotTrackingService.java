package com.deepen.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.deepen.domain.LotMasterDTO;
import com.deepen.domain.LotProcessDTO;
import com.deepen.domain.LotQcDTO;
import com.deepen.mapper.LotTrackingMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LotTrackingService {
	private final LotTrackingMapper lotTrackingMapper;

	public List<LotMasterDTO> getLotTrackingByWorkOrder(Integer wiNo) {
		// 1) LOT 목록을 한 번에 가져오기
		List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByWorkOrder(wiNo);
		if (lotList.isEmpty()) {
			return lotList; // 없으면 그냥 반환
		}

		// 2) LOT NO 목록 추출
		List<String> lotNoList = lotList.stream().map(LotMasterDTO::getLotNo).collect(Collectors.toList());

		// 3) 공정 이력, QC 이력을 '배치' 형태로 한 번씩만 쿼리
		// 기존: for문 안에서 lotTrackingMapper.selectLotProcessHistory(...)
		// 변경: lotTrackingMapper.selectLotProcessHistoryBatch(lotNoList)
		List<LotProcessDTO> allProcessLogs = lotTrackingMapper.selectLotProcessHistoryBatch(lotNoList);
		List<LotQcDTO> allQcLogs = lotTrackingMapper.selectLotQcHistoryBatch(lotNoList);

		// 4) LOT NO 별로 공정 이력, QC 이력을 매핑
		// (Map<lot_no, List<LotProcessDTO>> 형태)
		Map<String, List<LotProcessDTO>> procMap = new HashMap<>();
		for (LotProcessDTO proc : allProcessLogs) {
			procMap.computeIfAbsent(proc.getLotNo(), k -> new ArrayList<>()).add(proc);
		}

		Map<String, List<LotQcDTO>> qcMap = new HashMap<>();
		for (LotQcDTO qc : allQcLogs) {
			qcMap.computeIfAbsent(qc.getLotNo(), k -> new ArrayList<>()).add(qc);
		}

		// 5) lotList에 붙여주기
		for (LotMasterDTO lot : lotList) {
			lot.setProcessHistory(procMap.getOrDefault(lot.getLotNo(), new ArrayList<>()));
			lot.setQcHistory(qcMap.getOrDefault(lot.getLotNo(), new ArrayList<>()));
		}

		return lotList;
	}

	public List<LotMasterDTO> getLotTrackingByProduct(Integer productNo) {
		log.info("Starting getLotTrackingByProduct with productNo: {}", productNo);

		long start = System.currentTimeMillis();

		// 1) LOT 목록 한 번에 조회
		List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByProduct(productNo);
		if (lotList.isEmpty()) {
			return lotList;
		}

		// 2) 모든 LOT의 LOT NO를 추출
		List<String> lotNoList = lotList.stream().map(LotMasterDTO::getLotNo).collect(Collectors.toList());

		// 3) QC 이력 일괄 조회(한 번의 쿼리만 사용)
		List<LotQcDTO> allQcLogs = lotTrackingMapper.selectLotQcHistoryBatch(lotNoList);

		// 4) QC 이력을 LOT NO 기준으로 Map 에 담음
		Map<String, List<LotQcDTO>> qcMap = new HashMap<>();
		for (LotQcDTO qc : allQcLogs) {
			qcMap.computeIfAbsent(qc.getLotNo(), k -> new ArrayList<>()).add(qc);
		}

		// 5) LOT 목록에 QC 이력 매핑
		for (LotMasterDTO lot : lotList) {
			List<LotQcDTO> qcList = qcMap.getOrDefault(lot.getLotNo(), new ArrayList<>());
			lot.setQcHistory(qcList);
		}

		// 6) 필요하다면 LOT 상태(DUMMY 등) 필터링
		lotList = lotList.stream().filter(lot -> !"DUMMY".equals(lot.getLotStatus())).collect(Collectors.toList());

		log.info("After filtering, remaining lots: {}", lotList.size());

		long end = System.currentTimeMillis();
		System.out.println("[LOG] Search took " + (end - start) + " ms");

		return lotList;
	}

	public LotMasterDTO getLotTrackingDetail(String lotNo) {
		log.info("Getting LOT detail for lotNo: {}", lotNo);

		try {
			List<LotMasterDTO> lotHierarchy = lotTrackingMapper.selectLotDetail(lotNo);
			if (lotHierarchy == null || lotHierarchy.isEmpty()) {
				log.warn("No data found for LOT: {}", lotNo);
				return null;
			}

			// 계층 구조 구성
			Map<String, LotMasterDTO> lotMap = new HashMap<>();
			LotMasterDTO rootLot = null;

			// 먼저 모든 LOT를 Map에 저장
			for (LotMasterDTO lot : lotHierarchy) {
				lotMap.put(lot.getLotNo(), lot);
				if (lot.getLotNo().equals(lotNo)) {
					rootLot = lot;
				}
			}

			if (rootLot == null) {
				log.warn("Root LOT not found in hierarchy for lotNo: {}", lotNo);
				return lotHierarchy.get(0);
			}

			// 부모-자식 관계 설정
			for (LotMasterDTO lot : lotHierarchy) {
				if (lot.getParentLotNo() != null && !lot.getLotNo().equals(lot.getParentLotNo())) {
					LotMasterDTO parentLot = lotMap.get(lot.getParentLotNo());
					if (parentLot != null) {
						parentLot.addChild(lot);
					}
				}
			}

			// 공정 이력과 품질검사 이력 조회
			rootLot.setProcessHistory(lotTrackingMapper.selectLotProcessHistory(lotNo));
			rootLot.setQcHistory(lotTrackingMapper.selectLotQcHistory(lotNo));

			log.info("Successfully loaded LOT details with {} children",
					rootLot.getChildren() != null ? rootLot.getChildren().size() : 0);

			return rootLot;

		} catch (Exception e) {
			log.error("Error while getting LOT detail for lotNo: " + lotNo, e);
			throw new RuntimeException("Failed to get LOT detail", e);
		}
	}

	/**
	 * 작업지시를 최상위로 하고 그 아래에 해당 작업지시에 속한 모든 LOT를 배치
	 */
	public Map<String, Object> getLotHierarchyByWorkOrder(Integer wiNo) {
		log.info("Getting LOT hierarchy for work order: {}", wiNo);

		try {
			// 작업지시 정보 조회
			Map<String, Object> workOrder = lotTrackingMapper.selectWorkOrderInfo(wiNo);
			if (workOrder == null) {
				log.warn("Work order not found: {}", wiNo);
				return null;
			}

			// 해당 작업지시에 속한 모든 LOT 조회
			List<LotMasterDTO> lotList = lotTrackingMapper.selectLotByWorkOrder(wiNo);

			// 각 LOT의 QC 이력 및 공정 이력 추가
			for (LotMasterDTO lot : lotList) {
				lot.setProcessHistory(lotTrackingMapper.selectLotProcessHistory(lot.getLotNo()));
				lot.setQcHistory(lotTrackingMapper.selectLotQcHistory(lot.getLotNo()));
			}

			// LOT 계층 구조 구성
			Map<String, LotMasterDTO> lotMap = new HashMap<>();
			List<LotMasterDTO> rootLots = new ArrayList<>();

			// 먼저 모든 LOT를 Map에 저장
			for (LotMasterDTO lot : lotList) {
				lotMap.put(lot.getLotNo(), lot);
			}

			// 부모-자식 관계 설정
			for (LotMasterDTO lot : lotList) {
				if (lot.getParentLotNo() != null && !lot.getLotNo().equals(lot.getParentLotNo())
						&& lotMap.containsKey(lot.getParentLotNo())) {
					LotMasterDTO parentLot = lotMap.get(lot.getParentLotNo());
					parentLot.addChild(lot);
				} else {
					// 부모가 없거나 부모가 작업지시에 포함되지 않은 경우 루트로 간주
					rootLots.add(lot);
				}
			}

			// 결과 맵 구성
			Map<String, Object> result = new HashMap<>();
			result.put("workOrder", workOrder);
			result.put("rootLots", rootLots);

			log.info("Successfully loaded LOT hierarchy for work order: {} with {} root lots", wiNo, rootLots.size());

			return result;

		} catch (Exception e) {
			log.error("Error while getting LOT hierarchy for work order: " + wiNo, e);
			throw new RuntimeException("Failed to get LOT hierarchy", e);
		}
	}

	public Map<String, Object> searchLots(String lotNo, Integer productNo, String processType, String searchText,
			int page, int size) {
		Map<String, Object> params = new HashMap<>();
		params.put("lotNo", lotNo);
		params.put("productNo", productNo);
		params.put("processType", processType);
		params.put("searchText", searchText);
		params.put("offset", page * size);
		params.put("limit", size);

		List<LotMasterDTO> lots = lotTrackingMapper.searchLots(params);
		int totalCount = lotTrackingMapper.countSearchLots(params);

		Map<String, Object> result = new HashMap<>();
		result.put("lots", lots);
		result.put("totalCount", totalCount);
		result.put("totalPages", (int) Math.ceil((double) totalCount / size));
		result.put("currentPage", page);

		return result;
	}
}