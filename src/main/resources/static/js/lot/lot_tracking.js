document.addEventListener('DOMContentLoaded', function() {
	class LotTrackingApp {
		constructor() {
			if (!this.checkRequiredElements()) {
				console.error('필수 DOM 요소가 없습니다.');
				return;
			}

			this.initializeVariables();
			this.initializeSplitView();
			this.initializeComponents();
			this.setupEventListeners();
			this.loadInitialData();
		}

		checkRequiredElements() {
			return document.getElementById('lotTreeView') &&
				document.getElementById('lotDetailsContent') &&
				document.getElementById('lotHierarchyView') &&
				document.getElementById('mainContent');
		}

		initializeSplitView() {
			try {
				this.split = Split(['#mainContent > .lot-tree-area', '#mainContent > .detail-container'], {
					sizes: [25, 75],
					minSize: [200, 400],
					gutterSize: 8,
					onDrag: () => {
						// 그리드 레이아웃 새로고침
						this.processHistoryGrid?.refreshLayout();
						this.qcHistoryGrid?.refreshLayout();
						// JSTree 새로고침
						if (this.lotTreeView?.jstree(true)) {
							this.lotTreeView.jstree('redraw', true);
						}
					}
				});

				// 윈도우 리사이즈 시 Split 뷰 조정
				window.addEventListener('resize', _.debounce(() => {
					this.split.setSizes([25, 75]);
					this.handleResize();
				}, 150));

			} catch (error) {
				console.error('Split view 초기화 실패:', error);
			}
		}

		initializeVariables() {
			this.selectedLotNo = null;
			this.isForward = true;
			this.treeData = [];
			this.currentLotData = null;
			this.lastSearchParams = null;
			this.isLoading = false;
			this.eventNamespace = '.lotTracking';
		}
		
		applyCustomStyles() {
			try {
				this.addCustomTreeStyles();
			} catch (error) {
				console.error('[applyCustomStyles] 스타일 적용 실패:', error);
			}
		}

		addCustomTreeStyles() {
		    const styleId = 'custom-jstree-styles';
		    
		    const style = document.createElement('style');
		    style.id = styleId;
		    style.innerHTML = `
		        .jstree-default {
		            line-height: 24px !important;
		        }

		        .jstree-default .jstree-node {
		            min-height: 24px !important;
		            line-height: 24px !important;
		            margin: 0 !important;
		            padding: 0 !important;
		        }


		        .jstree-default .jstree-children {
		            margin-left: 16px !important;
		        }

		        .jstree-default .jstree-icon {
		            line-height: 24px !important;
		            height: 24px !important;
		            vertical-align: middle !important;
		        }
		    `;
		    
		    document.head.appendChild(style);
		}

		// LOT 노드 텍스트 포맷팅
		formatLotNodeText(lot) {
			if (!lot) return '데이터 없음';

			const hasQcFailed = lot.qcHistory?.some(qc => qc.judgement === 'N');
			const statusBadge = this.getStatusBadge(lot.lotStatus);
			const warningIcon = hasQcFailed ?
				'<i class="bi bi-exclamation-triangle-fill qc-warning-icon"></i>' : '';

			return `
		        <div class="lot-node">
		            <div class="lot-node-text">
		                ${lot.lotNo} - ${lot.productName || '미지정'}
		                <span class="lot-node-status">${statusBadge}</span>
		            </div>
		            ${warningIcon}
		        </div>
		    `;
		}

		initializeComponents() {
			try {
				// 트리 뷰 초기화
				this.lotTreeView = $('#lotTreeView');
				this.lotDetailsView = $('#lotDetailsContent');
				this.lotHierarchyView = $('#lotHierarchyView');
				this.searchResultSummary = $('#searchResultSummary');

				if (!this.lotTreeView.length || !this.lotDetailsView.length || !this.lotHierarchyView.length) {
					throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
				}

				// 그리드 초기화
				this.initializeProcessHistoryGrid();
				this.initializeQcHistoryGrid();
                
                // 스타일 적용
                this.applyCustomStyles();
                
                // 작업지시 정보 초기화
                this.populateWorkOrderSelect();
			} catch (error) {
				console.error('컴포넌트 초기화 실패:', error);
				this.showErrorMessage('컴포넌트 초기화 중 오류가 발생했습니다.');
			}
		}

		initializeProcessHistoryGrid() {
			if (!document.getElementById('processHistoryGrid')) {
				console.error('processHistoryGrid element not found');
				return;
			}

			this.processHistoryGrid = new tui.Grid({
				el: document.getElementById('processHistoryGrid'),
				scrollX: false,
				scrollY: false,
				minBodyHeight: 200,
				rowHeaders: ['rowNum'],
				columns: [
					{
						header: '처리시간',
						name: 'createTime',
						formatter: ({ value }) => this.formatDateTime(value)
					},
					{
						header: '공정',
						name: 'processName',
						formatter: ({ value, row }) => `<div class="d-flex align-items-center">
                            <i class="bi ${this.getProcessTypeIcon(row.processType)} me-2"></i>${value || '-'}
                        </div>`
					},
					{
						header: '작업구분',
						name: 'actionType',
						formatter: ({ value }) => this.getActionTypeBadge(value)
					},
					{
						header: '투입수량',
						name: 'inputQty',
						align: 'right',
						formatter: ({ value }) => value ? value.toLocaleString() : '-'
					},
					{
						header: '산출수량',
						name: 'outputQty',
						align: 'right',
						formatter: ({ value }) => value ? value.toLocaleString() : '-'
					},
					{
						header: '작업자',
						name: 'createUser'
					}
				]
			});
		}

		initializeQcHistoryGrid() {
			if (!document.getElementById('qcHistoryGrid')) {
				console.error('qcHistoryGrid element not found');
				return;
			}

			this.qcHistoryGrid = new tui.Grid({
				el: document.getElementById('qcHistoryGrid'),
				scrollX: false,
				scrollY: false,
				minBodyHeight: 200,
				rowHeaders: ['rowNum'],
				columns: [
					{
						header: '검사시간',
						name: 'checkTime',
						formatter: ({ value }) => this.formatDateTime(value)
					},
					{
						header: '검사항목',
						name: 'qcName',
					},
					{
						header: '측정값',
						name: 'measureValue',
						align: 'right',
						formatter: ({ value, row }) => {
							const failureClass = row.judgement === 'N' ? 'text-danger fw-bold' : '';
							return `<span class="${failureClass}">
		                        ${value ? value.toFixed(2) : '-'}
		                    </span>`;
						}
					},
					{
						header: '판정',
						name: 'judgement',
						formatter: ({ row }) => {
							if (row.judgement === 'N') {
								return `<div class="d-flex align-items-center">
		                            <span class="badge bg-danger d-flex align-items-center gap-1">
		                                불합격
		                                <i class="bi bi-exclamation-triangle-fill"></i>
		                            </span>
		                        </div>`;
							}
							return '<span class="badge bg-success">합격</span>';
						}
					},
					{
						header: '검사자',
						name: 'inspector',
					}
				]
			});

			// 불량 행 강조를 위한 Row 클래스 설정
			this.qcHistoryGrid.on('onGridMounted', () => {
				this.qcHistoryGrid.on('onGridUpdated', () => {
					const rows = this.qcHistoryGrid.getData();
					rows.forEach((row, index) => {
						if (row.judgement === 'N') {
							this.qcHistoryGrid.addRowClassName(index, 'qc-failed');
						}
					});
				});
			});
		}

		setupEventListeners() {
			try {
				// 이벤트 네임스페이스 사용
				const ns = this.eventNamespace;
				
				// 기존 이벤트 리스너 모두 제거
				this.removeAllEventListeners();
				
				// 검색 버튼 클릭 이벤트
				$(document).off(`click${ns}.searchBtn`).on(`click${ns}.searchBtn`, '#searchButton', () => {
					this.searchLots();
				});

				// 검색 입력 필드에서 엔터 키 누를 때 검색 수행
				$(document).off(`keypress${ns}.searchInput`).on(`keypress${ns}.searchInput`, '#lotSearchInput', (e) => {
					if (e.which === 13) { // 엔터 키
						this.searchLots();
					}
				});

				// 제품 선택박스 변경 이벤트 - debounce 적용
				$(document).off(`change${ns}.productSelect`).on(`change${ns}.productSelect`, '#productSelect', 
					_.debounce(() => {
						console.log('제품 선택 변경됨:', $('#productSelect').val());
						this.searchLots();
					}, 300)
				);

				// 공정 유형 선택박스 변경 이벤트 - debounce 적용
				$(document).off(`change${ns}.processSelect`).on(`change${ns}.processSelect`, '#processSelect', 
					_.debounce(() => {
						console.log('공정 유형 선택 변경됨:', $('#processSelect').val());
						this.searchLots();
					}, 300)
				);

				// 검색 초기화 버튼
				$(document).off(`click${ns}.resetBtn`).on(`click${ns}.resetBtn`, '#resetSearchButton', () => {
					this.resetSearch();
				});
                
                // 작업지시 선택박스 변경 이벤트
                $(document).off(`change${ns}.workOrderSelect`).on(`change${ns}.workOrderSelect`, '#workOrderSelect', 
                    _.debounce(() => {
                        const wiNo = $('#workOrderSelect').val();
                        console.log('작업지시 선택 변경됨:', wiNo);
                        if (wiNo && wiNo !== '0') {
                            this.loadWorkOrderHierarchy(wiNo);
                        } else {
                            this.searchLots(); // 전체 조회
                        }
                    }, 300)
                );

				// 트리 뷰 이벤트
				if (this.lotTreeView && this.lotTreeView.length) {
					// 노드 선택 이벤트
					this.lotTreeView.off('select_node.jstree').on('select_node.jstree', async (e, data) => {
						try {
							console.log('[select_node.jstree] 이벤트 발생', data);

							if (data.node && data.node.original && data.node.original.lotNo) {
								const lotNo = data.node.original.lotNo;
								console.log('[select_node.jstree] 선택된 LOT 번호:', lotNo);

								// 선택된 LOT 번호 저장
								this.selectedLotNo = lotNo;

								// LOT 상세 정보 로드
								await this.loadLotDetails(lotNo);
							} else {
								console.warn('[select_node.jstree] 노드에 lotNo 속성이 없습니다:', data.node);
							}
						} catch (error) {
							console.error('[select_node.jstree] 노드 선택 처리 중 오류:', error);
							this.showErrorMessage('LOT 상세 정보를 불러오는 중 오류가 발생했습니다.');
						}
					});

					// 노드 렌더링 후 이벤트
					this.lotTreeView.off('after_open.jstree').on('after_open.jstree', () => {
						console.log('[after_open.jstree] 노드 열림');
					});
				}

				// 트리 로드 완료 이벤트
				this.lotTreeView.off('loaded.jstree').on('loaded.jstree', () => {
					console.log('[loaded.jstree] JSTree 로딩 완료');

					// 이전에 선택한 LOT이 있으면 다시 선택
					if (this.selectedLotNo) {
						const nodeId = this.lotTreeView.jstree(true).get_node_by_id(this.selectedLotNo);
						if (nodeId) {
							this.lotTreeView.jstree('select_node', nodeId);
						}
					}
				});

				// 트리 확장/축소 버튼
				$(document).off(`click${ns}.expandBtn`).on(`click${ns}.expandBtn`, '#expandAllBtn', () => {
					if (this.lotTreeView.jstree(true)) {
						this.lotTreeView.jstree('open_all');
					}
				});

				$(document).off(`click${ns}.collapseBtn`).on(`click${ns}.collapseBtn`, '#collapseAllBtn', () => {
					if (this.lotTreeView.jstree(true)) {
						this.lotTreeView.jstree('close_all');
					}
				});

				// 방향 전환 버튼 (있는 경우)
				$(document).off(`click${ns}.directionBtn`).on(`click${ns}.directionBtn`, '#directionToggleBtn', () => {
					this.toggleDirection();
				});

				// 탭 전환 이벤트
				$(document).off(`shown.bs.tab${ns}`).on(`shown.bs.tab${ns}`, 'a[data-bs-toggle="tab"]', (e) => {
					if (e.target.getAttribute('href') === '#processTab' || e.target.getAttribute('href') === '#qcTab') {
						this.processHistoryGrid?.refreshLayout();
						this.qcHistoryGrid?.refreshLayout();
					}
				});

				// LOT 카드 클릭 이벤트 (계층 구조)
				$(document).off(`click${ns}.lotCard`).on(`click${ns}.lotCard`, '.lot-card', (e) => {
					const lotNo = $(e.currentTarget).data('lot-no');
					if (lotNo) this.loadLotDetails(lotNo);
				});

				// 윈도우 리사이즈 이벤트 - 디바운스 적용
				$(window).off(`resize${ns}`).on(`resize${ns}`, 
					_.debounce(() => this.handleResize(), 150)
				);

			} catch (error) {
				console.error('이벤트 리스너 설정 실패:', error);
				this.showErrorMessage('이벤트 리스너 설정 중 오류가 발생했습니다.');
			}
		}

		// 모든 이벤트 리스너 제거 함수
		removeAllEventListeners() {
			const ns = this.eventNamespace;
			
			// 문서 레벨 이벤트 제거
			$(document).off(ns);
			
			// 윈도우 이벤트 제거
			$(window).off(ns);
			
			// JSTree 이벤트 제거
			if (this.lotTreeView && this.lotTreeView.length) {
				this.lotTreeView.off('select_node.jstree');
				this.lotTreeView.off('after_open.jstree');
				this.lotTreeView.off('loaded.jstree');
			}
		}

		toggleDirection() {
			try {
				this.isForward = !this.isForward;
				const $btn = $('#directionToggleBtn');
				if ($btn.length) {
					$btn.html(`
		                <i class="bi bi-arrow-${this.isForward ? 'down' : 'up'}-up me-2"></i>
		                ${this.isForward ? '정방향' : '역방향'}
		            `);
				}
				if (this.currentLotData) {
					this.renderHierarchyView(this.currentLotData);
				}
			} catch (error) {
				console.error('방향 전환 중 오류:', error);
			}
		}

		handleResize() {
			try {
				// 그리드 레이아웃 새로고침
				this.processHistoryGrid?.refreshLayout();
				this.qcHistoryGrid?.refreshLayout();

				// JSTree 새로고침
				if (this.lotTreeView?.jstree(true)) {
					this.lotTreeView.jstree('redraw', true);
				}

				// 모바일 대응
				if (window.innerWidth < 768) {
					$('.search-row').addClass('flex-column');
					$('.search-input-group, .form-select').addClass('w-100');
					// Split 뷰 비활성화 또는 조정
					this.split?.setSizes([100, 0]);
				} else {
					$('.search-row').removeClass('flex-column');
					$('.search-input-group, .form-select').removeClass('w-100');
					// Split 뷰 기본 비율로 복원
					this.split?.setSizes([25, 75]);
				}
			} catch (error) {
				console.error('리사이즈 처리 중 오류:', error);
			}
		}

		async loadInitialData() {
			try {
				this.showLoading();
				console.log('초기 데이터 로딩 중...');
				
				// 작업지시 선택박스 채우기 (이미 호출된 상태)
				
				// 작업지시가 선택된 경우 해당 작업지시의 계층 구조 로드
				const wiNo = $('#workOrderSelect').val();
				if (wiNo && wiNo !== '0') {
					await this.loadWorkOrderHierarchy(wiNo);
				} else {
					// 서버에서 데이터 가져오기
					const result = await this.fetchLots();
					const lots = result.lots || [];
					
					if (lots && lots.length > 0) {
						await this.renderLotTree(lots);
						this.populateProductSelect(lots);
						this.hideLoading();
						this.hideSearchResultSummary();
					} else {
						this.showMessage('데이터가 없습니다.');
					}
				}
			} catch (error) {
				console.error('초기 데이터 로드 실패:', error);
				this.showErrorMessage('데이터 로드에 실패했습니다.');
			}
		}

		async fetchLots(params = {}) {
			try {
				// 검색 파라미터 가져오기
				const productNo = params.productNo || $('#productSelect').val() || '0';
				const processType = params.processType || $('#processSelect').val() || '';
				const searchText = params.searchText || $('#lotSearchInput').val() || '';

				console.log(`[fetchLots] 파라미터: productNo=${productNo}, processType=${processType}, searchText=${searchText}`);

				// API 요청 URL 생성 (기존 API 사용)
				const apiUrl = `/api/lot/product/${productNo}`;
				console.log(`[fetchLots] API 요청 URL: ${apiUrl}`);

				// API 요청 전송
				const response = await fetch(apiUrl, {
					headers: {
						'Cache-Control': 'no-cache',
						'Pragma': 'no-cache'
					}
				});

				if (!response.ok) {
					console.error(`[fetchLots] API 오류: ${response.status} ${response.statusText}`);
					throw new Error(`LOT 데이터 조회 실패 (${response.status})`);
				}

				// 응답 처리
				const data = await response.json();
				
				// 데이터가 배열인 경우
				let lots = Array.isArray(data) ? data : (data.lots || data.data || []);
				
				// 필터링
				if (processType) {
					lots = lots.filter(lot => lot.processType === processType);
				}
				if (searchText) {
					const lowerSearchText = searchText.toLowerCase();
					lots = lots.filter(lot => 
						(lot.lotNo && lot.lotNo.toLowerCase().includes(lowerSearchText)) || 
						(lot.productName && lot.productName.toLowerCase().includes(lowerSearchText))
					);
				}
				
				return {
					lots: lots,
					totalCount: lots.length
				};
			} catch (error) {
				console.error('[fetchLots] LOT 데이터 조회 실패:', error);
				this.handleError(error, 'LOT 데이터 조회 중 오류가 발생했습니다.');
				return { lots: [], totalCount: 0 };
			}
		}

		async loadLotDetails(lotNo) {
			if (!lotNo) {
				console.warn('유효하지 않은 LOT 번호');
				this.hideLoading();
				return;
			}

			try {
				this.showLoading();
				console.log('LOT 상세 정보 조회:', lotNo);

				// API 요청 전송 시작 시간 기록
				const startTime = Date.now();

				const response = await fetch(`/api/lot/${lotNo}`);

				// API 요청 완료 시간 및 응답 상태 로깅
				const endTime = Date.now();
				console.log(`[loadLotDetails] API 응답 시간: ${endTime - startTime}ms, 상태: ${response.status}`);

				if (!response.ok) {
					throw new Error(`LOT 상세 정보 조회 실패 (${response.status})`);
				}

				const lotDetail = await response.json();
				console.log('[loadLotDetails] 받은 데이터:', lotDetail);

				if (!lotDetail) {
					console.error('LOT 상세 정보 없음');
					this.showMessage(`"${lotNo}" LOT 정보를 찾을 수 없습니다.`, 'warning');
					this.hideLoading();
					return;
				}

				this.currentLotData = lotDetail;

				// QC 데이터 로깅 추가
				console.log('LOT QC History:', lotDetail?.qcHistory);
				if (lotDetail?.qcHistory) {
					const failedQc = lotDetail.qcHistory.filter(qc => qc.judgement === 'N');
					console.log('불량 QC 항목:', failedQc);
				}

				// 계층 구조 데이터 확인
				console.log('LOT 계층 구조:', lotDetail?.children);

				// 데이터 업데이트 및 렌더링
				this.updateLotDetails(lotDetail);
				this.renderHierarchyView(lotDetail);

				// 공정 이력과 품질 이력 데이터가 있는 경우에만 그리드 업데이트
				if (Array.isArray(lotDetail.processHistory)) {
					console.log(`[loadLotDetails] 공정 이력 ${lotDetail.processHistory.length}개 로드`);
					this.processHistoryGrid?.resetData(lotDetail.processHistory || []);
				} else {
					console.log('[loadLotDetails] 공정 이력 없음');
					this.processHistoryGrid?.resetData([]);
				}

				if (Array.isArray(lotDetail.qcHistory)) {
					console.log(`[loadLotDetails] 품질 이력 ${lotDetail.qcHistory.length}개 로드`);
					this.qcHistoryGrid?.resetData(lotDetail.qcHistory || []);
				} else {
					console.log('[loadLotDetails] 품질 이력 없음');
					this.qcHistoryGrid?.resetData([]);
				}

				// 로딩 상태 해제
				this.hideLoading();
			} catch (error) {
				console.error('LOT 상세 정보 로드 실패:', error);
				this.showErrorMessage(`LOT 상세 정보 로드에 실패했습니다. (${error.message})`);
				this.hideLoading();
			}
		}

		async renderLotTree(lots) {
			if (!this.lotTreeView?.length) {
				console.error('[renderLotTree] LOT 트리 뷰 엘리먼트를 찾을 수 없습니다.');
				return;
			}

			try {
				console.log(`[renderLotTree] 시작: ${lots?.length || 0}개 LOT`);
				
				// 기존 JSTree 제거
				if (this.lotTreeView.jstree(true)) {
					console.log('[renderLotTree] 기존 JSTree 제거');
					this.lotTreeView.jstree('destroy');
				}

				if (!Array.isArray(lots) || lots.length === 0) {
					console.log('[renderLotTree] 표시할 LOT 데이터 없음');
					this.lotTreeView.html('<div class="text-center p-4">검색 결과가 없습니다.</div>');
					return;
				}

				// 트리 데이터 변환
				console.log('[renderLotTree] LOT 데이터를 트리 구조로 변환');
				const treeData = this.transformLotsToTreeData(lots);
				console.log(`[renderLotTree] 생성된 루트 노드 수: ${treeData.length}`);
				
				if (treeData.length === 0) {
					console.warn('[renderLotTree] 변환된 트리 데이터가 비어 있음');
					this.lotTreeView.html('<div class="text-center p-4">표시할 데이터가 없습니다.</div>');
					return;
				}

				// JSTree 초기화
				console.log('[renderLotTree] JSTree 초기화 시작');
				await this.initializeJSTree(treeData);
				console.log('[renderLotTree] JSTree 초기화 완료');
				
				// 트리 확장
				setTimeout(() => {
					try {
						if (this.lotTreeView.jstree(true)) {
							console.log('[renderLotTree] 모든 노드 확장');
							this.lotTreeView.jstree('open_all');
						}
					} catch (error) {
						console.error('[renderLotTree] 노드 확장 실패:', error);
					}
				}, 300);
			} catch (error) {
				console.error('[renderLotTree] 트리 렌더링 실패:', error);
				this.showErrorMessage('트리 구조를 표시하는데 실패했습니다.');
			}
		}

		async initializeJSTree(treeData) {
			return new Promise((resolve, reject) => {
				try {
					console.log('[initializeJSTree] 시작: 노드 수', treeData.length);
					
					if (this.lotTreeView.jstree(true)) {
						console.log('[initializeJSTree] 기존 JSTree 제거');
						this.lotTreeView.jstree('destroy');
					}

					console.log('[initializeJSTree] JSTree 생성 중...');
					this.lotTreeView.jstree({
						core: {
							themes: {
								name: 'default',
								responsive: true,
								dots: false,
								icons: true
							},
							data: treeData,
							check_callback: true,
							multiple: false,
							expand_selected_onload: true,
							dblclick_toggle: false
						},
						types: {
							default: { icon: 'bi bi-diagram-3' },
							process: { icon: 'bi bi-gear' },
						    inspection: { icon: 'bi bi-check-circle' }
						},
						plugins: ['types', 'wholerow', 'search', 'state'],
						search: {
							show_only_matches: true,
							show_only_matches_children: true
						},
						state: {
							key: 'lot-tree-state',
							filter: function(state) {
								delete state.core.selected;
								return state;
							}
						}
					});

					// 이벤트 핸들러 등록
					this.lotTreeView
						.off('ready.jstree')
						.on('ready.jstree', () => {
							console.log('[initializeJSTree] JSTree 초기화 완료');
							
							// 모든 노드 확장
							setTimeout(() => {
								try {
									console.log('[initializeJSTree] 모든 노드 확장 시도');
									this.lotTreeView.jstree('open_all');
									
									// 노드 수 확인
									const allNodes = this.lotTreeView.jstree(true).get_json('#', {flat: true});
									console.log(`[initializeJSTree] 총 표시된 노드 수: ${allNodes.length}`);
								} catch (error) {
									console.error('[initializeJSTree] 노드 확장 오류:', error);
								}
								
								resolve();
							}, 100);
						})
						.off('error.jstree')
						.on('error.jstree', (e, data) => {
							console.error('[initializeJSTree] JSTree 초기화 실패:', data);
							reject(new Error('JSTree 초기화 실패'));
						});

					// 노드 선택 이벤트
					this.lotTreeView
						.off('select_node.jstree')
						.on('select_node.jstree', (e, data) => {
							console.log('[initializeJSTree] 노드 선택됨:', data.node.id);
							this.handleNodeSelection(data);
						});
						
					// 노드 확장/축소 이벤트
					this.lotTreeView
						.off('after_open.jstree')
						.on('after_open.jstree', (e, data) => {
							console.log('[initializeJSTree] 노드 확장됨:', data.node.id);
						})
						.off('after_close.jstree')
						.on('after_close.jstree', (e, data) => {
							console.log('[initializeJSTree] 노드 축소됨:', data.node.id);
						});
				} catch (error) {
					console.error('[initializeJSTree] JSTree 초기화 중 오류:', error);
					reject(error);
				}
			});
		}
		
		async handleNodeSelection(data) {
			try {
				console.log('노드 선택됨:', data);
				
				if (data && data.node && data.node.original) {
					const lotNo = data.node.original.lotNo;
					console.log('선택된 LOT 번호:', lotNo);
					
					if (lotNo) {
						// 로딩 표시
						this.showLoading();
						
						// 상세 정보 로드
						await this.loadLotDetails(lotNo);
					} else {
						console.warn('선택된 노드에 LOT 번호가 없음:', data.node);
					}
				} else {
					console.warn('잘못된 노드 선택 데이터:', data);
				}
			} catch (error) {
				console.error('노드 선택 처리 중 오류:', error);
				this.showErrorMessage('상세 정보를 불러오는 중 오류가 발생했습니다.');
				this.hideLoading();
			}
		}

		transformLotsToTreeData(lots) {
			if (!Array.isArray(lots)) {
				console.error('[transformLotsToTreeData] 유효하지 않은 LOT 데이터');
				return [];
			}

			try {
				console.log('[transformLotsToTreeData] 시작: 총 LOT 수', lots.length);
				
				// LOT 데이터를 복사하여 가공
				const processedLots = lots.map(lot => ({
					...lot,
					id: lot.lotNo, // 고유 ID 추가
					children: [] // 자식 노드를 담을 배열 초기화
				}));
				
				// ID 기반의 맵 생성 (빠른 검색용)
				const lotsMap = new Map();
				processedLots.forEach(lot => {
					lotsMap.set(lot.lotNo, lot);
				});
				
				// 부모-자식 관계 설정
				const rootLots = [];
				
				processedLots.forEach(lot => {
					// 부모 LOT가 있고, 자기 자신이 아닌 경우
					if (lot.parentLotNo && lot.lotNo !== lot.parentLotNo) {
						const parent = lotsMap.get(lot.parentLotNo);
						if (parent) {
							// 부모 LOT에 자식으로 추가
							parent.children.push(lot);
						} else {
							// 부모 LOT를 찾을 수 없는 경우 루트로 처리
							rootLots.push(lot);
						}
					} else {
						// 부모가 없거나 자기 자신인 경우 루트로 처리
						rootLots.push(lot);
					}
				});
				
				console.log(`[transformLotsToTreeData] 루트 LOT 수: ${rootLots.length}`);
				
				// 트리 구조로 변환
				const convertToTreeNode = (lot) => {
					return {
						id: lot.lotNo,
						text: this.formatLotNodeText(lot),
						icon: this.getProcessTypeIcon(lot.processType),
						lotNo: lot.lotNo,
						processType: lot.processType,
						parentLotNo: lot.parentLotNo,
						data: lot,
						children: lot.children.map(child => convertToTreeNode(child)),
						state: { opened: true }
					};
				};
				
				const treeData = rootLots.map(root => convertToTreeNode(root));
				console.log(`[transformLotsToTreeData] 최종 트리 노드 수: ${treeData.length}`);
				
				return treeData;
			} catch (error) {
				console.error('[transformLotsToTreeData] LOT 트리 데이터 변환 실패:', error);
				return [];
			}
		}

		updateLotDetails(lot) {
			if (!lot || !this.lotDetailsView?.length) return;

			try {
				const statusBadge = this.getStatusBadge(lot.lotStatus);
				const processTypeClass = this.getProcessTypeClass(lot.processType);
				const hasQcFailed = lot.qcHistory?.some(qc => qc.judgement === 'N');
				const qcWarning = hasQcFailed ? `
		                    <div class="alert alert-danger mt-3">
		                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
		                        품질검사 불합격 항목이 존재합니다.
		                    </div>
		                ` : '';

				this.lotDetailsView.html(`
		                    <div class="lot-detail-card ${processTypeClass}">
		                        <div class="d-flex justify-content-between align-items-center mb-3">
		                            <h5 class="mb-0">${lot.lotNo}</h5>
		                            ${statusBadge}
		                        </div>
		                        <div class="row">
		                            <div class="col-md-6">
		                                <div class="info-group">
		                                    <label>제품명:</label>
		                                    <span>${lot.productName || '-'}</span>
		                                </div>
		                                <div class="info-group">
		                                    <label>공정:</label>
		                                    <span>${lot.processName || '-'}</span>
		                                </div>
		                                <div class="info-group">
		                                    <label>작업지시:</label>
		                                    <span>${lot.wiNo || '-'}</span>
		                                </div>
		                            </div>
		                            <div class="col-md-6">
		                                <div class="info-group">
		                                    <label>시작시간:</label>
		                                    <span>${this.formatDateTime(lot.startTime)}</span>
		                                </div>
		                                <div class="info-group">
		                                    <label>종료시간:</label>
		                                    <span>${this.formatDateTime(lot.endTime)}</span>
		                                </div>
		                                <div class="info-group">
		                                    <label>작업자:</label>
		                                    <span>${lot.createUser || '-'}</span>
		                                </div>
		                            </div>
		                        </div>
		                        ${qcWarning}
		                    </div>
		                `);
			} catch (error) {
				console.error('LOT 상세 정보 업데이트 실패:', error);
				this.showErrorMessage('상세 정보를 표시하는데 실패했습니다.');
			}
		}

		renderHierarchyView(lotData) {
			if (!this.lotHierarchyView?.length) return;

			try {
				if (!lotData) {
					this.lotHierarchyView.html('<div class="text-center p-4">데이터가 없습니다.</div>');
					return;
				}

				const displayData = this.isForward ? lotData : this.reverseHierarchy(lotData);
				const hierarchyHtml = this.createHierarchyHtml(displayData);
				this.lotHierarchyView.html(hierarchyHtml);

				// 계층구조 클릭 이벤트는 이벤트 위임을 사용하여 setupEventListeners에서 처리됨
			} catch (error) {
				console.error('계층 구조 렌더링 실패:', error);
				this.showErrorMessage('계층 구조를 표시하는데 실패했습니다.');
			}
		}

		createHierarchyHtml(lot, level = 0) {
			if (!lot) return '';

			const processTypeClass = this.getProcessTypeClass(lot.processType);
			const statusBadge = this.getStatusBadge(lot.lotStatus);
			const hasQcFailed = lot.qcHistory?.some(qc => qc.judgement === 'N');
			const warningIcon = hasQcFailed ?
				'<i class="bi bi-exclamation-triangle-fill text-danger qc-warning-icon"></i>' : '';

			let html = `
		        <div class="hierarchy-level" style="margin-left: ${level * 40}px">
		            <div class="lot-card ${processTypeClass}" data-lot-no="${lot.lotNo}">
		                <div class="card-header">
		                    <div class="d-flex align-items-center">
		                        <h6 class="mb-0">${lot.lotNo}</h6>
		                        ${statusBadge}
		                    </div>
		                    ${warningIcon}
		                </div>
		                <div class="card-body py-2">
		                    <div class="info-item">
		                        <i class="bi bi-box me-2"></i>
		                        <small>${lot.productName || '미지정'}</small>
		                    </div>
		                </div>
		            </div>
		        </div>`;

			if (Array.isArray(lot.children) && lot.children.length > 0) {
				html += '<div class="children-wrapper">';
				lot.children.forEach(child => {
					html += this.createHierarchyHtml(child, level + 1);
				});
				html += '</div>';
			}

			return html;
		}

		reverseHierarchy(lot) {
			if (!lot) return null;

			try {
				const reversed = { ...lot };
				if (Array.isArray(reversed.children) && reversed.children.length > 0) {
					reversed.children = reversed.children
						.map(child => this.reverseHierarchy(child))
						.filter(Boolean)
						.reverse();
				}
				return reversed;
			} catch (error) {
				console.error('계층 구조 역전 실패:', error);
				return lot;
			}
		}

		populateProductSelect(lots) {
			const $select = $('#productSelect');
			if (!$select.length || !Array.isArray(lots)) return;

			try {
				const uniqueProducts = _.uniqBy(lots, 'productNo')
					.filter(lot => lot?.productNo && lot?.productName);

				const options = uniqueProducts.map(product =>
					`<option value="${product.productNo}">${product.productName}</option>`
				);

				$select.html('<option value="0">전체 제품</option>' + options.join(''))
					.val(0);
			} catch (error) {
				console.error('제품 선택 옵션 설정 실패:', error);
			}
		}

		async searchLots() {
			try {
				const searchText = $('#lotSearchInput').val() || '';
				const productNo = $('#productSelect').val();
				const processType = $('#processSelect').val();

				console.log(`검색 시작: 텍스트=${searchText}, 제품번호=${productNo}, 공정유형=${processType}`);

				// 작업지시 선택 초기화 (작업지시와 일반 검색은 별도로 동작)
				$('#workOrderSelect').val('0');
				this.selectedWorkOrderNo = null;

				// 검색 조건 저장
				this.lastSearchParams = {
					searchText,
					productNo,
					processType
				};

				this.showLoading();

				// 서버에서 필터링된 데이터 가져오기
				const result = await this.fetchLots(this.lastSearchParams);
				const lots = result.lots || [];
				const totalItems = result.totalCount || 0;

				if (lots && lots.length > 0) {
					// JSTree를 초기화하기 전에 현재 선택된 노드를 기억
					const previouslySelectedLotNo = this.selectedLotNo;

					// 트리 렌더링
					await this.renderLotTree(lots);

					// 검색 결과 요약 정보 표시
					this.showSearchResultSummary(totalItems, {
						searchText,
						productName: $('#productSelect option:selected').text() !== '전체 제품' ?
							$('#productSelect option:selected').text() : '',
						processType
					});

					// 이전에 선택된 LOT이 검색 결과에 있는지 확인하고 다시 선택
					if (previouslySelectedLotNo) {
						const lotExists = lots.some(lot => lot.lotNo === previouslySelectedLotNo);
						if (lotExists && this.lotTreeView.jstree(true)) {
							// 약간의 지연 후 선택 (트리가 완전히 렌더링될 시간을 줌)
							setTimeout(() => {
								this.lotTreeView.jstree('select_node', previouslySelectedLotNo);
							}, 100);
						} else {
							// 기존 선택된 LOT이 검색 결과에 없으면 선택 초기화
							this.selectedLotNo = null;
							this.currentLotData = null;
							// 안내 메시지 표시
							this.lotDetailsView.html('<div class="text-center p-4">LOT을 선택하여 상세 정보를 확인하세요.</div>');
							// 계층 구조 비우기
							this.lotHierarchyView.html('<div class="text-center p-4">LOT을 선택하여 계층 구조를 확인하세요.</div>');
							// 그리드 비우기
							this.processHistoryGrid?.resetData([]);
							this.qcHistoryGrid?.resetData([]);
						}
					}
				} else {
					// 검색 결과가 없는 경우
					this.showMessage('검색 조건에 맞는 LOT가 없습니다. 검색 조건을 변경해 주세요.', 'warning');

					// 트리 비우기
					this.clearTreeView();
					this.hideSearchResultSummary();
				}

				this.hideLoading();

			} catch (error) {
				console.error('LOT 검색 실패:', error);
				this.showErrorMessage(`검색 중 오류가 발생했습니다: ${error.message}`);
				this.hideLoading();
			}
		}

		// 트리 뷰 초기화
		clearTreeView() {
			if (this.lotTreeView?.jstree(true)) {
				this.lotTreeView.jstree('destroy');
			}
			this.lotTreeView.html('<div class="text-center p-4">검색 결과가 없습니다.</div>');
		}

		// 작업지시 선택박스 초기화
		async populateWorkOrderSelect() {
			try {
				const $select = $('#workOrderSelect');
				if (!$select.length) return;
				
				// 기본 옵션
				$select.html('<option value="0">전체 작업지시</option>');
				
				// 작업지시 목록 조회 API가 있다면 호출
				// 여기서는 임시로 기존 LOT 데이터에서 작업지시 번호를 추출
				const result = await this.fetchLots();
				const lots = result.lots || [];
				
				if (lots.length > 0) {
					// wiNo 기준으로 중복 제거
					const uniqueWorkOrders = _.uniqBy(lots, 'wiNo')
						.filter(lot => lot?.wiNo)
						.sort((a, b) => b.wiNo - a.wiNo); // 내림차순 정렬
						
					const options = uniqueWorkOrders.map(lot => 
						`<option value="${lot.wiNo}">${lot.wiNo} - ${lot.productName || '미지정 제품'}</option>`
					);
					
					$select.append(options.join(''));
				}
			} catch (error) {
				console.error('작업지시 목록 로드 실패:', error);
			}
		}

		// 검색 초기화 함수
		resetSearch() {
			// 입력 필드 초기화
			$('#lotSearchInput').val('');
			$('#productSelect').val('0');
			$('#processSelect').val('');
			$('#workOrderSelect').val('0');

			// 검색 결과 요약 숨기기
			this.hideSearchResultSummary();

			// 초기 데이터 다시 로드
			this.loadInitialData();
		}
        
        // 작업지시 계층구조 로드
        async loadWorkOrderHierarchy(wiNo) {
            if (!wiNo) return;
            
            try {
                this.showLoading();
                console.log(`작업지시 계층구조 로드: ${wiNo}`);
                
                // 작업지시 계층구조 API 호출
                const apiUrl = `/api/lot/hierarchy/work-order/${wiNo}`;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`작업지시 계층구조 로드 실패 (${response.status})`);
                }
                
                const data = await response.json();
                console.log('[loadWorkOrderHierarchy] 받은 데이터:', data);
                
                if (!data || !data.workOrder) {
                    this.showMessage(`작업지시 ${wiNo}에 대한 정보를 찾을 수 없습니다.`, 'warning');
                    this.hideLoading();
                    return;
                }
                
                // 선택된 작업지시 번호 저장
                this.selectedWorkOrderNo = wiNo;
                
                // 트리 데이터 변환 및 렌더링
                const treeData = this.transformWorkOrderToTreeData(data);
                await this.renderLotTree(treeData);
                
                // 작업지시 정보 요약 표시
                const workOrder = data.workOrder;
                this.showSearchResultSummary(data.rootLots?.length || 0, {
                    workOrderNo: workOrder.wiNo,
                    workOrderName: workOrder.wiName,
                    productName: workOrder.productName
                });
                
                this.hideLoading();
            } catch (error) {
                console.error('작업지시 계층구조 로드 실패:', error);
                this.showErrorMessage(`작업지시 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
                this.hideLoading();
            }
        }
        
        // 작업지시 계층구조 데이터 변환
        transformWorkOrderToTreeData(data) {
            if (!data || !data.workOrder) return [];
            
            try {
                const workOrder = data.workOrder;
                const rootLots = data.rootLots || [];
                
                // 작업지시를 최상위 노드로 설정
                const workOrderNode = {
                    id: `wo-${workOrder.wiNo}`,
                    text: this.formatWorkOrderNodeText(workOrder),
                    icon: 'bi bi-clipboard-data',
                    state: { opened: true },
                    workOrderNo: workOrder.wiNo,
                    children: []
                };
                
                // 루트 LOT들을 자식 노드로 추가
                if (rootLots.length > 0) {
                    // LOT 데이터를 계층 구조로 변환
                    rootLots.forEach(lot => {
                        const lotNode = this.transformLotToTreeNode(lot);
                        workOrderNode.children.push(lotNode);
                    });
                }
                
                return [workOrderNode];
            } catch (error) {
                console.error('[transformWorkOrderToTreeData] 작업지시 트리 데이터 변환 실패:', error);
                return [];
            }
        }
        
        // 작업지시 노드 텍스트 포맷팅
        formatWorkOrderNodeText(workOrder) {
            if (!workOrder) return '작업지시 정보 없음';
            
            const statusText = workOrder.statusName || '상태 미지정';
            const statusBadge = `<span class="status-badge bg-blue-100">${statusText}</span>`;
            
            return `
                <div class="wo-node">
                    <div class="wo-node-text">
                        작업지시 ${workOrder.wiNo} - ${workOrder.productName || '미지정 제품'}
                        ${statusBadge}
                    </div>
                </div>
            `;
        }
        
        // LOT을 트리 노드로 변환
        transformLotToTreeNode(lot) {
            const node = {
                id: lot.lotNo,
                text: this.formatLotNodeText(lot),
                icon: this.getProcessTypeIcon(lot.processType),
                lotNo: lot.lotNo,
                processType: lot.processType,
                parentLotNo: lot.parentLotNo,
                data: lot,
                state: { opened: true },
                children: []
            };
            
            // 자식 LOT 처리
            if (Array.isArray(lot.children) && lot.children.length > 0) {
                lot.children.forEach(child => {
                    node.children.push(this.transformLotToTreeNode(child));
                });
            }
            
            return node;
        }

		// 검색 결과 요약 표시
		showSearchResultSummary(count, searchCriteria = {}) {
			const $summary = $('#searchResultSummary');
			if (!$summary.length) return;

			let summaryText = '';
            
            // 작업지시 기준 조회인 경우
            if (searchCriteria.workOrderNo) {
                summaryText = `작업지시: ${searchCriteria.workOrderNo} (${searchCriteria.productName || '미지정 제품'})`;
                if (count > 0) {
                    summaryText += `, ${count}개의 LOT`;
                }
            } else {
                // 일반 검색인 경우
                summaryText = `검색 결과: ${count}개의 LOT`;
                
                const criteria = [];
                if (searchCriteria.productName) {
                    criteria.push(`제품: ${searchCriteria.productName}`);
                }
                if (searchCriteria.processType) {
                    const processMap = {
                        'PRTP001': '공정',
                        'PRTP002': '품질검사',
                        'PRTP003': '입고',
                        'PRTP004': '출고'
//                        'QRTP001': '품질검사',
//                        'IRTP001': '입고',
//                        'ORTP001': '출고'
                    };
                    criteria.push(`공정: ${processMap[searchCriteria.processType] || searchCriteria.processType}`);
                }
                if (searchCriteria.searchText) {
                    criteria.push(`검색어: "${searchCriteria.searchText}"`);
                }
                
                if (criteria.length > 0) {
                    summaryText += ` (${criteria.join(', ')})`;
                }
            }

			$summary.text(summaryText).show();
		}

		// 검색 결과 요약 숨기기
		hideSearchResultSummary() {
			const $summary = $('#searchResultSummary');
			if ($summary.length) {
				$summary.hide();
			}
		}

		formatDateTime(dateStr) {
			if (!dateStr) return '-';
			try {
				return new Date(dateStr).toLocaleString('ko-KR', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				});
			} catch (error) {
				console.error('날짜 포맷 변환 실패:', error);
				return '-';
			}
		}

		getStatusBadge(status) {
			if (!status) return this.getDefaultStatusBadge();

			try {
				const statusMap = {
					'LTST001': ['status-created', '생성', 'bi-plus-circle'],
					'LTST002': ['status-progress', '공정 진행중', 'bi-arrow-repeat'],
					'LTST003': ['status-complete', '검사 대기', 'bi-hourglass'],
					'LTST004': ['status-hold', '검사 진행중', 'bi-clipboard-check'],
					'LTST005': ['status-cancel', '입고 대기', 'bi-box-arrow-in-down'],
					'LTST006': ['status-cancel', '입고 완료', 'bi-box-seam'],
					'LTST007': ['status-cancel', '공정 완료', 'bi-check-circle'],
					'LTST008': ['status-cancel', '검사 완료', 'bi-check-square'],
					'LTST009': ['status-complete', '출고 대기', 'bi-box-arrow-up'],
					'LTST010': ['status-complete', '출고 완료', 'bi-truck']
				};

				const [className, label, icon] = statusMap[status] || ['status-created', '미지정', 'bi-question-circle'];
				return `<span class="status-badge ${className}"><i class="bi ${icon}"></i> ${label}</span>`;
			} catch (error) {
				console.error('상태 배지 생성 실패:', error);
				return this.getDefaultStatusBadge();
			}
		}

		getDefaultStatusBadge() {
			return '<span class="status-badge status-created"><i class="bi bi-question-circle"></i> 미지정</span>';
		}

		getActionTypeBadge(actionType) {
			if (!actionType) return '-';

			try {
				const badges = {
					'START': '<span class="badge bg-primary">시작</span>',
					'END': '<span class="badge bg-success">완료</span>',
					'HOLD': '<span class="badge bg-warning">보류</span>',
					'CANCEL': '<span class="badge bg-danger">취소</span>'
				};
				return badges[actionType] || actionType;
			} catch (error) {
				console.error('작업 타입 배지 생성 실패:', error);
				return actionType || '-';
			}
		}

		getJudgementBadge(row) {
			if (!row?.judgement) return '-';

			try {
				const badges = {
					'Y': '<span class="badge bg-success">합격</span>',
					'N': `<span class="badge bg-danger d-flex align-items-center gap-1">
				                            불합격
				                            <i class="bi bi-exclamation-triangle-fill"></i>
				                        </span>`
				};
				return badges[row.judgement] || row.judgement;
			} catch (error) {
				console.error('판정 배지 생성 실패:', error);
				return row.judgement || '-';
			}
		}

		getProcessTypeIcon(processType) {
			if (!processType) return 'bi bi-question-circle';

			try {
				const iconMap = {
					'PRTP001': 'bi bi-gear',
					'PRTP002': 'bi bi-tools',
					'PRTP003': 'bi bi-box-arrow-in-down',
					'PRTP004': 'bi bi-box-arrow-up'
				};
				return iconMap[processType] || 'bi bi-question-circle';
			} catch (error) {
				console.error('프로세스 타입 아이콘 생성 실패:', error);
				return 'bi bi-question-circle';
			}
		}

		getProcessTypeClass(processType) {
			if (!processType) return 'process-default';

			try {
				const iconMap = {
					'PRTP001': 'bi bi-gear',
					'PRTP002': 'bi bi-tools',
					'PRTP003': 'bi bi-box-arrow-in-down',
					'PRTP004': 'bi bi-box-arrow-up'
				};
				return classMap[processType] || 'process-default';
			} catch (error) {
				console.error('프로세스 타입 클래스 생성 실패:', error);
				return 'process-default';
			}
		}

		showMessage(message, type = 'info') {
			if (!this.lotDetailsView?.length) return;

			try {
				const alertClass = `alert alert-${type}`;
				const iconClass = type === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle';

				this.lotDetailsView.html(`
				                    <div class="${alertClass} d-flex align-items-center">
				                        <i class="bi ${iconClass} me-2"></i>
				                        ${message}
				                    </div>
				                `);
			} catch (error) {
				console.error('메시지 표시 실패:', error);
			}
		}

		showErrorMessage(message) {
			this.showMessage(message, 'danger');
		}

		showLoading() {
			if (!this.lotDetailsView?.length) return;

			try {
				// 이미 로딩 중이면 중복 표시하지 않음
				if (this.isLoading) return;

				this.isLoading = true;

				const loadingHtml = `
		            <div class="text-center p-4 loading-indicator">
		                <div class="spinner-border text-primary" role="status">
		                    <span class="visually-hidden">Loading...</span>
		                </div>
		                <p class="mt-2 text-muted">데이터를 불러오는 중입니다...</p>
		            </div>
		        `;

				// 기존 내용을 로딩 인디케이터로 교체
				this.lotDetailsView.html(loadingHtml);

				console.log('[showLoading] 로딩 인디케이터 표시');
			} catch (error) {
				console.error('[showLoading] 로딩 표시 실패:', error);
			}
		}

		hideLoading() {
			if (!this.lotDetailsView?.length) return;

			try {
				// 로딩 상태 해제
				this.isLoading = false;

				// 로딩 인디케이터가 있는지 확인
				const $loadingIndicator = this.lotDetailsView.find('.loading-indicator');

				if ($loadingIndicator.length) {
					console.log('[hideLoading] 로딩 인디케이터 제거');

					// 선택된 LOT 데이터가 없는 경우 안내 메시지 표시
					if (!this.currentLotData) {
						this.lotDetailsView.html(`
		                    <div class="text-center p-4">
		                        <i class="bi bi-info-circle text-primary mb-3" style="font-size: 2rem;"></i>
		                        <p>LOT을 선택하여 상세 정보를 확인하세요.</p>
		                    </div>
		                `);
					}
					// 선택된 LOT 데이터가 있는 경우 updateLotDetails 함수에서 내용을 채움
				}
			} catch (error) {
				console.error('[hideLoading] 로딩 숨기기 실패:', error);
			}
		}

		handleError(error, message) {
			console.error(error);
			this.showErrorMessage(message);
		}

		// 소멸자 함수
		destroy() {
			try {
				// 모든 이벤트 리스너 제거
				this.removeAllEventListeners();
				
				// JSTree 인스턴스 제거
				if (this.lotTreeView && this.lotTreeView.jstree) {
					this.lotTreeView.jstree('destroy');
				}
				
				// 그리드 인스턴스 정리
				if (this.processHistoryGrid) {
					this.processHistoryGrid.destroy();
				}
				
				if (this.qcHistoryGrid) {
					this.qcHistoryGrid.destroy();
				}
				
				// Split.js 인스턴스 정리
				if (this.split) {
					this.split.destroy();
				}
				
				console.log('LotTrackingApp 인스턴스가 정리되었습니다.');
			} catch (error) {
				console.error('인스턴스 정리 중 오류:', error);
			}
		}
	}

	// 페이지 로드 시 앱 인스턴스 생성
	try {
		// 기존 인스턴스가 있으면 정리
		if (window.lotTrackingApp) {
			window.lotTrackingApp.destroy();
			window.lotTrackingApp = null;
		}
		
		// 새 인스턴스 생성
		window.lotTrackingApp = new LotTrackingApp();
	} catch (error) {
		console.error('Application initialization failed:', error);

		const errorHtml = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    초기화 오류
                </h4>
                <p>애플리케이션을 초기화하는 중 오류가 발생했습니다.</p>
                <hr>
                <p class="mb-0">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
            </div>
        `;
		const lotTreeView = document.getElementById('lotTreeView');
		if (lotTreeView) {
			lotTreeView.innerHTML = errorHtml;
		}
	}
	
	// 윈도우 언로드 시 리소스 정리
	window.addEventListener('beforeunload', () => {
		if (window.lotTrackingApp) {
			window.lotTrackingApp.destroy();
			window.lotTrackingApp = null;
		}
	});
});