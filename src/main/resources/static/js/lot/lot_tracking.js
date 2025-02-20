document.addEventListener('DOMContentLoaded', function() {
	class LotTrackingApp {
		constructor() {
			this.initializeVariables();
			this.initializeComponents();
			this.setupEventListeners();
			this.loadInitialData();
		}

		initializeVariables() {
			this.selectedLotNo = null;
			this.isForward = true;
			this.treeData = [];
			this.currentLotData = null;
		}

		initializeComponents() {
			// 트리 뷰 초기화
			this.lotTreeView = $('#lotTreeView');
			this.lotDetailsView = $('#lotDetailsContent');
			this.lotHierarchyView = $('#lotHierarchyView');

			// 그리드 초기화
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
						formatter: ({ value }) => value ? value.toFixed(2) : '-'
					},
					{
						header: '판정',
						name: 'judgement',
						width: 100,
						formatter: ({ value }) => this.getJudgementBadge(value)
					},
					{
						header: '검사자',
						name: 'inspector',
						width: 100
					}
				]
			});
		}

		setupEventListeners() {
			// 검색 이벤트
			$('#searchButton').on('click', () => this.searchLots());
			$('#lotSearchInput').on('keyup', _.debounce(() => this.searchLots(), 300));
			$('#productSelect').on('change', () => this.searchLots());
			$('#processSelect').on('change', () => this.searchLots());

			// 트리 뷰 이벤트
			this.lotTreeView.on('select_node.jstree', (e, data) => {
				if (data.node.original && data.node.original.lotNo) {
					this.loadLotDetails(data.node.original.lotNo);
				}
			});

			// 방향 전환 버튼
			$('#directionToggleBtn').on('click', () => this.toggleDirection());

			// 탭 전환 이벤트
			$('a[data-bs-toggle="tab"]').on('shown.bs.tab', (e) => {
				if (e.target.getAttribute('href') === '#history') {
					this.processHistoryGrid.refreshLayout();
					this.qcHistoryGrid.refreshLayout();
				}
			});

			// 반응형 처리
			$(window).on('resize', _.debounce(() => this.handleResize(), 150));
		}

		handleResize() {
			this.processHistoryGrid.refreshLayout();
			this.qcHistoryGrid.refreshLayout();
		}

		toggleDirection() {
			this.isForward = !this.isForward;
			$('#directionToggleBtn').html(`
                <i class="bi bi-arrow-${this.isForward ? 'down' : 'up'}-up me-2"></i>
                ${this.isForward ? '정방향' : '역방향'}
            `);
			if (this.currentLotData) {
				this.renderHierarchyView(this.currentLotData);
			}
		}

		async loadInitialData() {
			try {
				console.log('초기 데이터 로딩 중...');
				const lots = await this.fetchLots();
				if (lots && lots.length > 0) {
					this.renderLotTree(lots);
					this.populateProductSelect(lots);
				} else {
					this.showMessage('데이터가 없습니다.');
				}
			} catch (error) {
				console.error('초기 데이터 로드 실패:', error);
				this.showErrorMessage('데이터 로드에 실패했습니다.');
			}
		}

		async fetchLots(params = {}) {
			const defaultParams = {
				productNo: $('#productSelect').val() || 0,
				processType: $('#processSelect').val() || ''
			};
			const queryParams = { ...defaultParams, ...params };

			const response = await fetch(`/api/lot/product/${queryParams.productNo}`);
			if (!response.ok) throw new Error('LOT 데이터 조회 실패');
			return await response.json();
		}

		renderLotTree(lots) {
			if (this.lotTreeView.jstree(true)) {
				this.lotTreeView.jstree('destroy');
			}

			const treeData = this.transformLotsToTreeData(lots);
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
				plugins: ['types', 'wholerow', 'search', 'state']
			});
		}

		transformLotsToTreeData(lots) {
			const rootLots = lots.filter(lot => lot.lotNo === lot.parentLotNo);
			const otherLots = lots.filter(lot => lot.lotNo !== lot.parentLotNo);

			const buildHierarchy = (parentLot) => {
				const children = otherLots.filter(lot => lot.parentLotNo === parentLot.lotNo);
				return children.map(child => ({
					text: this.formatLotNodeText(child),
					icon: this.getProcessTypeIcon(child.processType),
					lotNo: child.lotNo,
					data: child,
					children: buildHierarchy(child)
				}));
			};

			return rootLots.map(root => ({
				text: this.formatLotNodeText(root),
				icon: this.getProcessTypeIcon(root.processType),
				lotNo: root.lotNo,
				data: root,
				children: buildHierarchy(root),
				state: { opened: true }
			}));
		}

		formatLotNodeText(lot) {
			const statusBadge = this.getStatusBadge(lot.lotStatus);
			return `${lot.lotNo} - ${lot.productName || '미지정'} ${statusBadge}`;
		}

		async loadLotDetails(lotNo) {
			try {
				const response = await fetch(`/api/lot/${lotNo}`);
				if (!response.ok) throw new Error('LOT 상세 정보 조회 실패');

				const lotDetail = await response.json();
				this.currentLotData = lotDetail;

				this.updateLotDetails(lotDetail);
				this.renderHierarchyView(lotDetail);
				this.processHistoryGrid.resetData(lotDetail.processHistory || []);
				this.qcHistoryGrid.resetData(lotDetail.qcHistory || []);
			} catch (error) {
				console.error('Error loading lot details:', error);
				this.showErrorMessage('LOT 상세 정보 로드에 실패했습니다.');
			}
		}

		updateLotDetails(lot) {
			const statusBadge = this.getStatusBadge(lot.lotStatus);
			const processTypeClass = this.getProcessTypeClass(lot.processType);

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
                </div>
            `);
		}

		renderHierarchyView(lotData) {
			if (!lotData) {
				this.lotHierarchyView.html('<div class="text-center p-4">데이터가 없습니다.</div>');
				return;
			}

			const displayData = this.isForward ? lotData : this.reverseHierarchy(lotData);
			const hierarchyHtml = this.createHierarchyHtml(displayData);
			this.lotHierarchyView.html(hierarchyHtml);

			$('.lot-card').on('click', (e) => {
				const lotNo = $(e.currentTarget).data('lot-no');
				this.loadLotDetails(lotNo);
			});
		}

		createHierarchyHtml(lot, level = 0) {
			const processTypeClass = this.getProcessTypeClass(lot.processType);
			const statusBadge = this.getStatusBadge(lot.lotStatus);

			let html = `
                <div class="hierarchy-level" style="margin-left: ${level * 40}px">
                    <div class="lot-card ${processTypeClass}" data-lot-no="${lot.lotNo}">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${lot.lotNo}</h6>
                            ${statusBadge}
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
                </div>
            `;

			if (lot.children && lot.children.length > 0) {
				html += '<div class="children-wrapper">';
				lot.children.forEach(child => {
					html += this.createHierarchyHtml(child, level + 1);
				});
				html += '</div>';
			}

			return html;
		}

		reverseHierarchy(lot) {
			const reversed = { ...lot };
			if (reversed.children && reversed.children.length > 0) {
				reversed.children = reversed.children.map(child => this.reverseHierarchy(child));
				reversed.children.reverse();
			}
			return reversed;
		}

		populateProductSelect(lots) {
			const uniqueProducts = _.uniqBy(lots, 'productNo')
				.filter(lot => lot.productNo && lot.productName);

			const options = uniqueProducts.map(product =>
				`<option value="${product.productNo}">${product.productName}</option>`
			);

			$('#productSelect')
				.html('<option value="0">전체 제품</option>' + options.join(''))
				.val(0);
		}

		searchLots() {
			const searchText = $('#lotSearchInput').val().toLowerCase();
			const productNo = $('#productSelect').val();
			const processType = $('#processSelect').val();

			if (this.lotTreeView.jstree(true)) {
				this.lotTreeView.jstree('search', searchText);
			}
		}

		// Utility 메소드
		formatDateTime(dateStr) {
			if (!dateStr) return '-';
			return new Date(dateStr).toLocaleString('ko-KR');
		}

		getStatusBadge(status) {
			const statusMap = {
				'LTST001': ['status-created', '생성'],
				'LTST002': ['status-progress', '공정 진행중'],
				'LTST003': ['status-complete', '검사 대기'],
				'LTST004': ['status-hold', '검사 진행중'],
				'LTST005': ['status-cancel', '입고 대기'],
				'LTST006': ['status-cancel', '입고 완료'],
				'LTST007': ['status-cancel', '공정 완료'],
				'LTST008': ['status-cancel', '검사 완료'],
				'LTST009': ['status-complete', '출고 대기'],
				'LTST010': ['status-complete', '출고 완료']
			};
			const [className, label] = statusMap[status] || ['status-created', '미지정'];
			return `<span class="status-badge ${className}">${label}</span>`;
		}

		getActionTypeBadge(actionType) {
			const badges = {
				'START': '<span class="badge bg-primary">시작</span>',
				'END': '<span class="badge bg-success">완료</span>',
				'HOLD': '<span class="badge bg-warning">보류</span>',
				'CANCEL': '<span class="badge bg-danger">취소</span>'
			};
			return badges[actionType] || actionType;
		}

		getJudgementBadge(judgement) {
			const badges = {
				'Y': '<span class="badge bg-success">합격</span>',
				'N': '<span class="badge bg-danger">불합격</span>'
			};
			return badges[judgement] || judgement;
		}

		getProcessTypeIcon(processType) {
			const iconMap = {
				'PRTP001': 'bi bi-gear',         // 공정
				'PRTP002': 'bi bi-tools',        // 조립
				'PRTP003': 'bi bi-fire',         // 열처리
				'QRTP001': 'bi bi-search',       // 품질검사
				'IRTP001': 'bi bi-box-arrow-in-down',  // 입고
				'ORTP001': 'bi bi-box-arrow-up'  // 출고
			};
			return iconMap[processType] || 'bi bi-question-circle';
		}

		getProcessTypeClass(processType) {
			const classMap = {
				'PRTP001': 'process-machining',   // 공정
				'PRTP002': 'process-assembly',    // 조립
				'PRTP003': 'process-heat',        // 열처리
				'QRTP001': 'process-qc',          // 품질검사
				'IRTP001': 'process-in',          // 입고
				'ORTP001': 'process-out'          // 출고
			};
			return classMap[processType] || 'process-default';
		}

		showMessage(message, type = 'info') {
			const alertClass = `alert alert-${type}`;
			const iconClass = type === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle';

			this.lotDetailsView.html(`
			                <div class="${alertClass} d-flex align-items-center">
			                    <i class="bi ${iconClass} me-2"></i>
			                    ${message}
			                </div>
			            `);
		}

		showErrorMessage(message) {
			this.showMessage(message, 'danger');
		}

		showLoading() {
			const loadingHtml = `
			                <div class="text-center p-4">
			                    <div class="spinner-border text-primary" role="status">
			                        <span class="visually-hidden">Loading...</span>
			                    </div>
			                    <p class="mt-2 text-muted">데이터를 불러오는 중입니다...</p>
			                </div>
			            `;
			this.lotDetailsView.html(loadingHtml);
		}

		hideLoading() {
			// 로딩 표시 제거 (필요한 경우)
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

		// 에러 메시지 표시
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
		document.getElementById('lotTreeView').innerHTML = errorHtml;
	}
});