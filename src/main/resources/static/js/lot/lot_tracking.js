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

				if (!this.lotTreeView.length || !this.lotDetailsView.length || !this.lotHierarchyView.length) {
					throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
				}

				// 그리드 초기화
				this.initializeProcessHistoryGrid();
				this.initializeQcHistoryGrid();
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
						width: 150,
						formatter: ({ value }) => this.formatDateTime(value)
					},
					{
						header: '공정',
						name: 'processName',
						width: 120,
						formatter: ({ value }) => `<div class="d-flex align-items-center">
                            <i class="bi bi-gear me-2"></i>${value || '-'}
                        </div>`
					},
					{
						header: '작업구분',
						name: 'actionType',
						width: 100,
						formatter: ({ value }) => this.getActionTypeBadge(value)
					},
					{
						header: '투입수량',
						name: 'inputQty',
						width: 100,
						align: 'right',
						formatter: ({ value }) => value ? value.toLocaleString() : '-'
					},
					{
						header: '산출수량',
						name: 'outputQty',
						width: 100,
						align: 'right',
						formatter: ({ value }) => value ? value.toLocaleString() : '-'
					},
					{
						header: '작업자',
						name: 'createUser',
						width: 100
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
						width: 150,
						formatter: ({ value }) => this.formatDateTime(value)
					},
					{
						header: '검사항목',
						name: 'qcName',
						width: 150
					},
					{
						header: '측정값',
						name: 'measureValue',
						width: 100,
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
						width: 100,
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
						width: 100
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
				// 검색 이벤트
				$('#searchButton').on('click', () => this.searchLots());
				$('#lotSearchInput').on('keyup', _.debounce(() => this.searchLots(), 300));
				$('#productSelect').on('change', () => this.searchLots());
				$('#processSelect').on('change', () => this.searchLots());

				// 트리 뷰 이벤트
				if (this.lotTreeView && this.lotTreeView.length) {
					this.lotTreeView.on('select_node.jstree', async (e, data) => {
						try {
							if (data.node && data.node.original && data.node.original.lotNo) {
								const lotNo = data.node.original.lotNo;
								await this.loadLotDetails(lotNo);
							}
						} catch (error) {
							console.error('노드 선택 처리 중 오류:', error);
						}
					});
				}

				// 트리 로드 완료 이벤트
				this.lotTreeView.on('loaded.jstree', () => {
					console.log('JSTree 로딩 완료');
				});

				// 트리 확장/축소 버튼
				$('#expandAllBtn').on('click', () => {
					if (this.lotTreeView.jstree(true)) {
						this.lotTreeView.jstree('open_all');
					}
				});

				$('#collapseAllBtn').on('click', () => {
					if (this.lotTreeView.jstree(true)) {
						this.lotTreeView.jstree('close_all');
					}
				});

				// 방향 전환 버튼 (있는 경우)
				$('#directionToggleBtn').on('click', () => this.toggleDirection());

				// 탭 전환 이벤트
				$('a[data-bs-toggle="tab"]').on('shown.bs.tab', (e) => {
					if (e.target.getAttribute('href') === '#processTab' || e.target.getAttribute('href') === '#qcTab') {
						this.processHistoryGrid?.refreshLayout();
						this.qcHistoryGrid?.refreshLayout();
					}
				});

				// 반응형 처리
				$(window).on('resize', _.debounce(() => this.handleResize(), 150));

			} catch (error) {
				console.error('이벤트 리스너 설정 실패:', error);
				this.showErrorMessage('이벤트 리스너 설정 중 오류가 발생했습니다.');
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
				const lots = await this.fetchLots();
				if (lots && lots.length > 0) {
					await this.renderLotTree(lots);
					this.populateProductSelect(lots);
					this.hideLoading();
				} else {
					this.showMessage('데이터가 없습니다.');
				}
			} catch (error) {
				console.error('초기 데이터 로드 실패:', error);
				this.showErrorMessage('데이터 로드에 실패했습니다.');
			}
		}

		async fetchLots(params = {}) {
			try {
				const defaultParams = {
					productNo: $('#productSelect').val() || 0,
					processType: $('#processSelect').val() || ''
				};
				const queryParams = { ...defaultParams, ...params };

				const response = await fetch(`/api/lot/product/${queryParams.productNo}`);
				if (!response.ok) throw new Error('LOT 데이터 조회 실패');
				return await response.json();
			} catch (error) {
				console.error('LOT 데이터 조회 실패:', error);
				this.handleError(error, 'LOT 데이터 조회 중 오류가 발생했습니다.');
				return [];
			}
		}

		async loadLotDetails(lotNo) {
			if (!lotNo) {
				console.warn('유효하지 않은 LOT 번호');
				return;
			}

			try {
				this.showLoading();
				console.log('LOT 상세 정보 조회:', lotNo);

				const response = await fetch(`/api/lot/${lotNo}`);
				if (!response.ok) {
					throw new Error(`LOT 상세 정보 조회 실패 (${response.status})`);
				}

				const lotDetail = await response.json();
				this.currentLotData = lotDetail;

				// QC 데이터 로깅 추가
				console.log('LOT QC History:', lotDetail?.qcHistory);
				if (lotDetail?.qcHistory) {
					const failedQc = lotDetail.qcHistory.filter(qc => qc.judgement === 'N');
					console.log('불량 QC 항목:', failedQc);
				}

				if (this.currentLotData) {
					this.updateLotDetails(lotDetail);
					this.renderHierarchyView(lotDetail);

					// 공정 이력과 품질 이력 데이터가 있는 경우에만 그리드 업데이트
					if (Array.isArray(lotDetail.processHistory)) {
						this.processHistoryGrid?.resetData(lotDetail.processHistory);
					}
					if (Array.isArray(lotDetail.qcHistory)) {
						this.qcHistoryGrid?.resetData(lotDetail.qcHistory);
					}
				}

				this.hideLoading();
			} catch (error) {
				console.error('LOT 상세 정보 로드 실패:', error);
				this.showErrorMessage(`LOT 상세 정보 로드에 실패했습니다. (${error.message})`);
				this.hideLoading();
			}
		}

		async renderLotTree(lots) {
			if (!this.lotTreeView?.length) {
				console.error('LOT 트리 뷰 엘리먼트를 찾을 수 없습니다.');
				return;
			}

			try {
				if (this.lotTreeView.jstree(true)) {
					this.lotTreeView.jstree('destroy');
				}

				const treeData = this.transformLotsToTreeData(lots);
				await this.initializeJSTree(treeData);
			} catch (error) {
				console.error('트리 렌더링 실패:', error);
				this.showErrorMessage('트리 구조를 표시하는데 실패했습니다.');
			}
		}

		async initializeJSTree(treeData) {
			return new Promise((resolve, reject) => {
				try {
					this.lotTreeView.jstree({
						core: {
							themes: {
								name: 'default',
								responsive: true,
								dots: true,
								icons: true
							},
							data: treeData
						},
						types: {
							default: { icon: 'bi bi-diagram-3' }
						},
						plugins: ['types', 'wholerow', 'search', 'state'],
						search: {
							show_only_matches: true,
							show_only_matches_children: true
						}
					}).on('ready.jstree', () => {
						resolve();
					}).on('error.jstree', (e, data) => {
						reject(new Error('JSTree 초기화 실패'));
					});
				} catch (error) {
					reject(error);
				}
			});
		}

		transformLotsToTreeData(lots) {
			if (!Array.isArray(lots)) {
				console.error('유효하지 않은 LOT 데이터');
				return [];
			}

			try {
				// parentLotNo가 없거나 자기 자신인 경우를 루트로 처리
				const rootLots = lots.filter(lot => !lot.parentLotNo || lot.lotNo === lot.parentLotNo);
				const otherLots = lots.filter(lot => lot.parentLotNo && lot.lotNo !== lot.parentLotNo);

				const buildHierarchy = (parentLot) => {
					if (!parentLot?.lotNo) return [];

					const children = otherLots.filter(lot => lot.parentLotNo === parentLot.lotNo);
					return children.map(child => ({
						text: this.formatLotNodeText(child),
						icon: this.getProcessTypeIcon(child.processType),
						lotNo: child.lotNo,
						processType: child.processType,
						parentLotNo: child.parentLotNo,
						data: child,
						children: buildHierarchy(child)
					}));
				};

				return rootLots.map(root => ({
					text: this.formatLotNodeText(root),
					icon: this.getProcessTypeIcon(root.processType),
					lotNo: root.lotNo,
					processType: root.processType,
					parentLotNo: root.parentLotNo,
					data: root,
					children: buildHierarchy(root),
					state: { opened: true }
				}));
			} catch (error) {
				console.error('LOT 트리 데이터 변환 실패:', error);
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

				// 계층구조 클릭 이벤트
				$('.lot-card').on('click', (e) => {
					const lotNo = $(e.currentTarget).data('lot-no');
					if (lotNo) this.loadLotDetails(lotNo);
				});
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
		                <div class="lot-info mt-2">
		                    <div class="info-item">
		                        <i class="bi bi-box"></i>
		                        <span>${lot.productName || '-'}</span>
		                    </div>
		                    <div class="info-item">
		                        <i class="bi bi-gear"></i>
		                        <span>${lot.processName || '-'}</span>
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

		searchLots() {
			try {
				const searchText = $('#lotSearchInput').val()?.toLowerCase() || '';
				const productNo = $('#productSelect').val();
				const processType = $('#processSelect').val();

				if (this.lotTreeView?.jstree(true)) {
					this.lotTreeView.jstree('search', searchText, {
						show_only_matches: true,
						show_only_matches_children: true
					});
				}
			} catch (error) {
				console.error('LOT 검색 실패:', error);
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
					'LTST006': ['status-cancel', '입고 완료', 'bi-box-arrow-in-down-fill'],
					'LTST007': ['status-cancel', '공정 완료', 'bi-check-circle'],
					'LTST008': ['status-cancel', '검사 완료', 'bi-check-square'],
					'LTST009': ['status-complete', '출고 대기', 'bi-box-arrow-up'],
					'LTST010': ['status-complete', '출고 완료', 'bi-box-arrow-up-fill']
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
					'PRTP001': 'bi bi-gear',         // 공정
					'PRTP002': 'bi bi-tools',        // 조립
					'PRTP003': 'bi bi-fire',         // 열처리
					'QRTP001': 'bi bi-search',       // 품질검사
					'IRTP001': 'bi bi-box-arrow-in-down',  // 입고
					'ORTP001': 'bi bi-box-arrow-up'  // 출고
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
				const classMap = {
					'PRTP001': 'process-machining',   // 공정
					'PRTP002': 'process-assembly',    // 조립
					'PRTP003': 'process-heat',        // 열처리
					'QRTP001': 'process-qc',          // 품질검사
					'IRTP001': 'process-in',          // 입고
					'ORTP001': 'process-out'          // 출고
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
				const loadingHtml = `
		                    <div class="text-center p-4">
		                        <div class="spinner-border text-primary" role="status">
		                            <span class="visually-hidden">Loading...</span>
		                        </div>
		                        <p class="mt-2 text-muted">데이터를 불러오는 중입니다...</p>
		                    </div>
		                `;
				this.lotDetailsView.html(loadingHtml);
			} catch (error) {
				console.error('로딩 표시 실패:', error);
			}
		}

		hideLoading() {
			// 필요한 경우 로딩 표시 제거
		}

		handleError(error, message) {
			console.error(error);
			this.showErrorMessage(message);
		}
	}

	// 페이지 로드 시 앱 인스턴스 생성
	try {
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
});