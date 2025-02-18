document.addEventListener('DOMContentLoaded', function() {
    class LotTrackingAPI {
        static ENDPOINTS = {
            WORK_ORDER: '/api/lot/work-order',
            PRODUCT: '/api/lot/product',
            LOT: '/api/lot'
        };

        static getCSRFToken() {
            const token = document.querySelector("meta[name='_csrf']");
            return token ? token.content : null;
        }

        static getCSRFHeaderName() {
            const header = document.querySelector("meta[name='_csrf_header']");
            return header ? header.content : null;
        }

        static async fetchWithConfig(url, options = {}) {
            try {
                const csrfToken = this.getCSRFToken();
                const csrfHeader = this.getCSRFHeaderName();

                const headers = {
                    'Content-Type': 'application/json',
                };

                if (csrfToken && csrfHeader) {
                    headers[csrfHeader] = csrfToken;
                }

                const defaultOptions = {
                    headers,
                    credentials: 'same-origin'
                };

                console.log('API Call:', url);
                const response = await fetch(url, { ...defaultOptions, ...options });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('API Response:', data);
                return data;
            } catch (error) {
                console.error('API Request Failed:', error);
                throw error;
            }
        }

        static async getByWorkOrder(wiNo) {
            console.log('Fetching by work order:', wiNo);
            return this.fetchWithConfig(`${this.ENDPOINTS.WORK_ORDER}/${wiNo || 0}`);
        }

        static async getByProduct(productNo) {
            console.log('Fetching by product:', productNo);
            return this.fetchWithConfig(`${this.ENDPOINTS.PRODUCT}/${productNo || 0}`);
        }

        static async getLotDetail(lotNo) {
            console.log('Fetching lot detail:', lotNo);
            return this.fetchWithConfig(`${this.ENDPOINTS.LOT}/${lotNo}`);
        }
    }

    class LotTrackingController {
        constructor() {
            console.log('Initializing LotTrackingController');
            this.initializeComponents();
            this.setupEventListeners();
            this.loadInitialData();
        }

        initializeComponents() {
            this.productList = new ProductListManager(this);
            this.workOrderList = new WorkOrderListManager(this);
            this.lotFlow = new LotFlowManager(this);
            this.historyGrid = new HistoryGridManager(this);
        }

        setupEventListeners() {
            // 검색 버튼 이벤트
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => this.handleSearch());
            } else {
                console.warn('Search button not found');
            }

            // 검색어 입력 이벤트
            const listSearchInput = document.getElementById('listSearchInput');
            if (listSearchInput) {
                listSearchInput.addEventListener('input', 
                    _.debounce(() => this.handleSearch(), 300)
                );
            } else {
                console.warn('List search input not found');
            }

            // 탭 변경 이벤트
            const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
            tabs.forEach(tab => {
                tab.addEventListener('shown.bs.tab', (event) => {
                    this.handleTabChange(event.target.getAttribute('data-bs-target'));
                });
            });

            // 필터 변경 이벤트
            ['statusFilter', 'processFilter'].forEach(id => {
                const filter = document.getElementById(id);
                if (filter) {
                    filter.addEventListener('change', () => this.handleFilterChange());
                } else {
                    console.warn(`Filter ${id} not found`);
                }
            });
        }

        async loadInitialData() {
            try {
                console.log('Loading initial data');
                const data = await LotTrackingAPI.getByProduct(0);
                if (data) {
                    this.productList.renderList(data);
                }
            } catch (error) {
                console.error('Initial data load failed:', error);
                this.showError('초기 데이터 로드에 실패했습니다.');
            }
        }

        async handleTabChange(tabId) {
            try {
                console.log('Tab changed to:', tabId);
                if (tabId === '#productTab') {
                    const data = await LotTrackingAPI.getByProduct(0);
                    this.productList.renderList(data || []);
                } else if (tabId === '#workOrderTab') {
                    const data = await LotTrackingAPI.getByWorkOrder(0);
                    this.workOrderList.renderList(data || []);
                }
            } catch (error) {
                console.error('Tab change data load failed:', error);
                this.showError('데이터 로드에 실패했습니다.');
            }
        }
		
		async handleSearch() {
            try {
                const searchParams = this.getSearchParams();
                console.log('Search params:', searchParams);

                const activeTab = document.querySelector('.nav-link.active');
                if (!activeTab) {
                    console.warn('No active tab found');
                    return;
                }

                const tabTarget = activeTab.getAttribute('data-bs-target');
                let data = [];

                if (tabTarget === '#productTab') {
                    data = await LotTrackingAPI.getByProduct(searchParams.productNo || 0);
                    this.productList.renderList(data || []);
                } else {
                    data = await LotTrackingAPI.getByWorkOrder(searchParams.wiNo || 0);
                    this.workOrderList.renderList(data || []);
                }
            } catch (error) {
                console.error('Search failed:', error);
                this.showError('검색에 실패했습니다.');
            }
        }

        getSearchParams() {
            return {
                wiNo: document.getElementById('searchWiNo')?.value || '',
                lotNo: document.getElementById('searchLotNo')?.value || '',
                productNo: document.getElementById('searchProduct')?.value || ''
            };
        }

        handleFilterChange() {
            this.handleSearch();
        }

        async handleProductSelect(lotData) {
            if (!lotData?.lotNo) {
                console.warn('No lot number provided for product selection');
                return;
            }
            
            try {
                console.log('Selected product lot:', lotData.lotNo);
                const detail = await LotTrackingAPI.getLotDetail(lotData.lotNo);
                
                if (detail) {
                    this.updateDetailView(detail, detail.productName);
                }
            } catch (error) {
                console.error('Product detail load failed:', error);
                this.showError('상세 정보 조회에 실패했습니다.');
            }
        }

        async handleWorkOrderSelect(lotData) {
            if (!lotData?.lotNo) {
                console.warn('No lot number provided for work order selection');
                return;
            }
            
            try {
                console.log('Selected work order lot:', lotData.lotNo);
                const detail = await LotTrackingAPI.getLotDetail(lotData.lotNo);
                
                if (detail) {
                    this.updateDetailView(detail, `작업지시 ${detail.wiNo}`);
                }
            } catch (error) {
                console.error('Work order detail load failed:', error);
                this.showError('상세 정보 조회에 실패했습니다.');
            }
        }

        updateDetailView(detail, title) {
            const titleElement = document.getElementById('selectedItemTitle');
            if (titleElement) {
                titleElement.textContent = title;
            }
            
            this.lotFlow.updateFlow(detail);
            this.historyGrid.loadData(detail);
        }

        showError(message) {
            console.error('Error:', message);
            alert(message);
        }
    }

    class ProductListManager {
        constructor(controller) {
            console.log('Initializing ProductListManager');
            this.controller = controller;
            this.container = document.getElementById('productList');
            
            if (!this.container) {
                console.error('Product list container not found');
            }
        }

        renderList(lots) {
            if (!this.container) {
                console.error('Cannot render product list: container not found');
                return;
            }
            
            console.log('Rendering product list:', lots);
            
            try {
                if (!lots || lots.length === 0) {
                    this.renderEmptyState();
                    return;
                }

                this.container.innerHTML = lots.map(lot => this.createProductCard(lot)).join('');
                this.addEventListeners();
            } catch (error) {
                console.error('Product list render error:', error);
                this.renderError();
            }
        }

        renderEmptyState() {
            this.container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-2"></i>
                    <p class="mt-2 mb-0">데이터가 없습니다.</p>
                </div>
            `;
        }

        renderError() {
            this.container.innerHTML = `
                <div class="text-center text-danger py-3">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mt-2 mb-0">데이터 표시 중 오류가 발생했습니다.</p>
                </div>
            `;
        }

        createProductCard(lot) {
            return `
                <div class="item-card" data-id="${lot.lotNo}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">${this.escapeHtml(lot.productName)}</h6>
                            <div class="text-muted small">작업지시: ${lot.wiNo}</div>
                        </div>
                        <span class="status-badge status-${(lot.lotStatus || '').toLowerCase()}">
                            ${this.getStatusText(lot.lotStatus)}
                        </span>
                    </div>
                    <div class="process-info mt-2 pt-2 border-top">
                        <div class="small mb-1">
                            <div class="d-flex justify-content-between">
                                <span>공정: ${this.escapeHtml(lot.processName || '-')}</span>
                                <span class="text-muted">${this.formatDate(lot.startTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        addEventListeners() {
            this.container.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    this.handleCardClick(card);
                });
            });
        }

        handleCardClick(card) {
            // 선택 효과 처리
            this.container.querySelectorAll('.item-card').forEach(c => 
                c.classList.remove('selected')
            );
            card.classList.add('selected');
            
            // 컨트롤러에 선택 이벤트 전달
            const lotNo = card.dataset.id;
            if (lotNo) {
                this.controller.handleProductSelect({ lotNo });
            } else {
                console.warn('Card clicked but no lot number found');
            }
        }

        getStatusText(status) {
            const statusMap = {
                'WAIT': '대기',
                'PROGRESS': '진행중',
                'COMPLETE': '완료'
            };
            return statusMap[status] || status || '-';
        }

        formatDate(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return '-';
            }
        }

        escapeHtml(str) {
            if (!str) return '-';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }
	
	class WorkOrderListManager {
        constructor(controller) {
            console.log('Initializing WorkOrderListManager');
            this.controller = controller;
            this.container = document.getElementById('workOrderList');
            
            if (!this.container) {
                console.error('Work order list container not found');
            }
        }

        renderList(lots) {
            if (!this.container) {
                console.error('Cannot render work order list: container not found');
                return;
            }
            
            console.log('Rendering work order list:', lots);
            
            try {
                if (!lots || lots.length === 0) {
                    this.renderEmptyState();
                    return;
                }

                this.container.innerHTML = lots.map(lot => this.createWorkOrderCard(lot)).join('');
                this.addEventListeners();
            } catch (error) {
                console.error('Work order list render error:', error);
                this.renderError();
            }
        }

        renderEmptyState() {
            this.container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-2"></i>
                    <p class="mt-2 mb-0">데이터가 없습니다.</p>
                </div>
            `;
        }

        renderError() {
            this.container.innerHTML = `
                <div class="text-center text-danger py-3">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mt-2 mb-0">데이터 표시 중 오류가 발생했습니다.</p>
                </div>
            `;
        }

        createWorkOrderCard(lot) {
            return `
                <div class="item-card" data-id="${lot.lotNo}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">작업지시 ${lot.wiNo}</h6>
                            <div class="text-muted small">
                                <span class="me-2">${this.escapeHtml(lot.productName)}</span>
                                <span>${this.formatDate(lot.startTime)}</span>
                            </div>
                        </div>
                        <span class="status-badge status-${(lot.lotStatus || '').toLowerCase()}">
                            ${this.getStatusText(lot.lotStatus)}
                        </span>
                    </div>
                    <div class="process-info mt-2 pt-2 border-top">
                        <div class="small mb-1">
                            <div class="d-flex justify-content-between">
                                <span>공정: ${this.escapeHtml(lot.processName || '-')}</span>
                                <span class="text-muted">라인: ${this.escapeHtml(lot.lineName || '-')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        addEventListeners() {
            this.container.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    this.handleCardClick(card);
                });
            });
        }

        handleCardClick(card) {
            // 선택 효과 처리
            this.container.querySelectorAll('.item-card').forEach(c => 
                c.classList.remove('selected')
            );
            card.classList.add('selected');
            
            // 컨트롤러에 선택 이벤트 전달
            const lotNo = card.dataset.id;
            if (lotNo) {
                this.controller.handleWorkOrderSelect({ lotNo });
            } else {
                console.warn('Card clicked but no lot number found');
            }
        }

        getStatusText(status) {
            const statusMap = {
                'WAIT': '대기',
                'PROGRESS': '진행중',
                'COMPLETE': '완료'
            };
            return statusMap[status] || status || '-';
        }

        formatDate(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return '-';
            }
        }

        escapeHtml(str) {
            if (!str) return '-';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }

    class LotFlowManager {
        constructor(controller) {
            console.log('Initializing LotFlowManager');
            this.controller = controller;
            this.container = document.getElementById('lotFlow');
            
            if (!this.container) {
                console.error('Lot flow container not found');
            }
        }

        updateFlow(lotData) {
            if (!this.container || !lotData) {
                console.error('Cannot update lot flow: container or data missing');
                return;
            }
            
            console.log('Updating lot flow:', lotData);
            
            try {
                const processNodes = this.generateProcessNodes(lotData);
                this.renderFlow(processNodes);
            } catch (error) {
                console.error('Lot flow update error:', error);
                this.renderError();
            }
        }

        renderError() {
            this.container.innerHTML = `
                <div class="text-center text-danger py-3">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mt-2 mb-0">공정 흐름도 표시 중 오류가 발생했습니다.</p>
                </div>
            `;
        }

        generateProcessNodes(lotData) {
            const nodes = [];
            
            // 작업지시 노드
            nodes.push({
                title: '작업지시',
                id: lotData.wiNo,
                status: lotData.lotStatus,
                children: []
            });

            // 공정 이력 노드들
            if (lotData.processHistory && Array.isArray(lotData.processHistory)) {
                lotData.processHistory.forEach(process => {
                    nodes[0].children.push({
                        title: process.processName,
                        id: process.processLogNo,
                        status: this.getProcessStatus(process),
                        info: `${process.actionType} (${process.inputQty || 0}/${process.outputQty || 0})`
                    });
                });
            }

            return nodes;
        }

        getProcessStatus(process) {
            if (!process) return 'WAIT';
            if (process.outputQty > 0) return 'COMPLETE';
            if (process.inputQty > 0) return 'PROGRESS';
            return 'WAIT';
        }

        renderFlow(nodes) {
            this.container.innerHTML = nodes.map(node => this.createFlowNode(node)).join('');
        }

        createFlowNode(node) {
            let html = `
                <div class="lot-node">
                    <div class="lot-title">
                        <i class="bi ${this.getNodeIcon(node.title)}"></i>
                        ${this.escapeHtml(node.title)}
                    </div>
                    <div class="lot-info">${node.id || '-'}</div>
                    <div class="status-badge status-${(node.status || '').toLowerCase()}">
                        ${this.getStatusText(node.status)}
                    </div>
                    ${node.info ? `<div class="lot-detail">${this.escapeHtml(node.info)}</div>` : ''}
                </div>
            `;

            if (node.children && node.children.length > 0) {
                html += `
                    <div class="lot-children">
                        ${node.children.map(child => this.createFlowNode(child)).join('')}
                    </div>
                `;
            }

            return html;
        }

        getNodeIcon(title) {
            const iconMap = {
                '작업지시': 'bi-file-text',
                '가공': 'bi-gear',
                '조립': 'bi-tools',
                '검사': 'bi-check-circle',
                '열처리': 'bi-thermometer-high',
                '표면처리': 'bi-brush'
            };
            return iconMap[title] || 'bi-circle';
        }

        getStatusText(status) {
            const statusMap = {
                'WAIT': '대기',
                'PROGRESS': '진행중',
                'COMPLETE': '완료'
            };
            return statusMap[status] || status || '-';
        }

        escapeHtml(str) {
            if (!str) return '-';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }
	
	class HistoryGridManager {
        constructor(controller) {
            console.log('Initializing HistoryGridManager');
            this.controller = controller;
            this.initialize();
        }

        initialize() {
            const el = document.getElementById('historyGrid');
            if (!el) {
                console.error('History grid container not found');
                return;
            }

            try {
                this.grid = new tui.Grid({
                    el,
                    scrollX: true,
                    scrollY: true,
                    rowHeaders: ['rowNum'],
                    columns: [
                        {
                            header: '처리시간',
                            name: 'processTime',
                            width: 150,
                            align: 'center',
                            formatter: ({ value }) => this.formatDateTime(value)
                        },
                        {
                            header: '구분',
                            name: 'type',
                            width: 100,
                            align: 'center'
                        },
                        {
                            header: 'LOT번호',
                            name: 'lotNo',
                            width: 120,
                            align: 'center'
                        },
                        {
                            header: '공정/작업',
                            name: 'process',
                            width: 150
                        },
                        {
                            header: '작업자',
                            name: 'worker',
                            width: 100,
                            align: 'center'
                        },
                        {
                            header: '상태',
                            name: 'status',
                            width: 100,
                            align: 'center',
                            formatter: ({ value }) => {
                                const statusMap = {
                                    'WAIT': { text: '대기', class: 'wait' },
                                    'PROGRESS': { text: '진행중', class: 'progress' },
                                    'COMPLETE': { text: '완료', class: 'complete' }
                                };
                                const status = statusMap[value] || { text: value || '-', class: '' };
                                return `<span class="status-badge status-${status.class}">${status.text}</span>`;
                            }
                        }
                    ]
                });
                console.log('History grid initialized');
            } catch (error) {
                console.error('History grid initialization error:', error);
                el.innerHTML = `
                    <div class="text-center text-danger py-3">
                        <i class="bi bi-exclamation-triangle fs-2"></i>
                        <p class="mt-2 mb-0">그리드 초기화 중 오류가 발생했습니다.</p>
                    </div>
                `;
            }
        }

        loadData(lotData) {
            if (!this.grid || !lotData) {
                console.error('Cannot load data: grid or data missing');
                return;
            }

            try {
                const historyData = this.transformHistoryData(lotData);
                this.grid.resetData(historyData);
            } catch (error) {
                console.error('History grid data load error:', error);
                this.grid.resetData([]);
            }
        }

        transformHistoryData(lotData) {
            const history = [];

            // LOT 생성 이력
            if (lotData.createTime) {
                history.push({
                    processTime: lotData.createTime,
                    type: 'LOT생성',
                    lotNo: lotData.lotNo,
                    process: '작업지시 등록',
                    worker: lotData.createUser,
                    status: lotData.lotStatus
                });
            }

            // 공정 이력 추가
            if (lotData.processHistory && Array.isArray(lotData.processHistory)) {
                lotData.processHistory.forEach(process => {
                    history.push({
                        processTime: process.createTime,
                        type: '공정',
                        lotNo: process.lotNo,
                        process: `${process.processName} (${process.actionType})`,
                        worker: process.createUser,
                        status: this.getProcessStatus(process)
                    });
                });
            }

            // 품질검사 이력 추가
            if (lotData.qcHistory && Array.isArray(lotData.qcHistory)) {
                lotData.qcHistory.forEach(qc => {
                    history.push({
                        processTime: qc.checkTime,
                        type: '품질검사',
                        lotNo: qc.lotNo,
                        process: `${qc.processName} - ${qc.qcName}`,
                        worker: qc.inspector,
                        status: qc.judgement
                    });
                });
            }

            return _.orderBy(history, ['processTime'], ['desc']);
        }

        getProcessStatus(process) {
            if (!process) return 'WAIT';
            if (process.outputQty > 0) return 'COMPLETE';
            if (process.inputQty > 0) return 'PROGRESS';
            return 'WAIT';
        }

		formatDateTime(dateStr) {
		            if (!dateStr) return '-';
		            try {
		                const date = new Date(dateStr);
		                return date.toLocaleString('ko-KR', {
		                    year: 'numeric',
		                    month: '2-digit',
		                    day: '2-digit',
		                    hour: '2-digit',
		                    minute: '2-digit',
		                    hour12: false
		                });
		            } catch (error) {
		                console.error('DateTime formatting error:', error);
		                return '-';
		            }
		        }
		    }

		    // 전역 에러 핸들러 설정
		    window.onerror = function(message, source, lineno, colno, error) {
		        console.error('Global error:', { message, source, lineno, colno, error });
		        return false;
		    };

		    // 비동기 에러 핸들러 설정
		    window.addEventListener('unhandledrejection', function(event) {
		        console.error('Unhandled promise rejection:', event.reason);
		    });

		    // 컨트롤러 초기화
		    try {
		        console.log('Initializing application...');
		        window.controller = new LotTrackingController();
		        console.log('Application initialized successfully');
		    } catch (error) {
		        console.error('Application initialization failed:', error);
		        alert('애플리케이션 초기화 중 오류가 발생했습니다.');
		    }
		});