document.addEventListener('DOMContentLoaded', function() {
    class LotTrackingApp {
        constructor() {
            this.initializeComponents();
            this.setupEventListeners();
            this.loadInitialData();
        }

        initializeComponents() {
            // 트리 뷰 초기화
            this.lotTreeView = $('#lotTreeView');
            this.lotDetailsView = $('#lotDetailsContent');

            // 그리드 초기화
            this.processHistoryGrid = new tui.Grid({
                el: document.getElementById('processHistoryGrid'),
                scrollX: false,
                scrollY: false,
                minBodyHeight: 200,
                columns: [
                    { header: '공정명', name: 'processName', align: 'center' },
                    { header: '작업구분', name: 'actionType', align: 'center' },
                    { header: '투입수량', name: 'inputQty', align: 'right' },
                    { header: '산출수량', name: 'outputQty', align: 'right' },
                    { header: '작업자', name: 'createUser', align: 'center' },
                    { 
                        header: '작업시간', 
                        name: 'createTime',
                        align: 'center',
                        formatter: ({value}) => value ? new Date(value).toLocaleString('ko-KR') : '-'
                    }
                ]
            });

            this.qcHistoryGrid = new tui.Grid({
                el: document.getElementById('qcHistoryGrid'),
                scrollX: false,
                scrollY: false,
                minBodyHeight: 200,
                columns: [
                    { header: '품질검사명', name: 'qcName', align: 'center' },
                    { header: '측정값', name: 'measureValue', align: 'right' },
                    { 
                        header: '판정', 
                        name: 'judgement',
                        align: 'center',
                        formatter: ({value}) => {
                            const badge = value === 'Y' ? 
                                '<span class="badge bg-success">합격</span>' : 
                                '<span class="badge bg-danger">불합격</span>';
                            return value ? badge : '-';
                        }
                    },
                    { header: '검사자', name: 'inspector', align: 'center' },
                    { 
                        header: '검사시간', 
                        name: 'checkTime',
                        align: 'center',
                        formatter: ({value}) => value ? new Date(value).toLocaleString('ko-KR') : '-'
                    }
                ]
            });
        }

        setupEventListeners() {
            $('#searchButton').on('click', () => this.searchLots());
            $('#lotSearchInput').on('keyup', _.debounce(() => this.searchLots(), 300));
        }

        async loadInitialData() {
            try {
                console.log('Loading initial data...');
                const lots = await this.fetchLots();
                if (lots && lots.length > 0) {
                    this.renderLotTree(lots);
                    this.populateProductSelect(lots);
                } else {
                    this.showMessage('데이터가 없습니다.');
                }
            } catch (error) {
                console.error('Initial data load failed:', error);
                this.showErrorMessage('데이터 로드에 실패했습니다.');
            }
        }

        async fetchLots(params = {}) {
            const defaultParams = { productNo: 0 };
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
                    default: { icon: 'bi bi-folder' },
                    lot: { icon: 'bi bi-file-text' }
                },
                plugins: ['types', 'wholerow', 'search']
            }).on('select_node.jstree', async (e, data) => {
                if (data.node.data) {
                    await this.loadLotDetails(data.node.data.lotNo);
                }
            });
        }

		transformLotsToTreeData(lots) {
	        const rootLots = lots.filter(lot => lot.lotNo === lot.parentLotNo);
	        
	        const childLots = lots.filter(lot => lot.lotNo !== lot.parentLotNo);
	        
	        const buildHierarchy = (parentLot) => {
	            const children = childLots.filter(child => child.parentLotNo === parentLot.lotNo);
	            const childNodes = children.map(child => ({
	                id: child.lotNo,
	                text: this.formatLotNodeText(child),
	                type: 'lot',
	                data: child,
	                children: buildHierarchy(child)
	            }));

	            return childNodes;
	        };

	        return rootLots.map(root => ({
	            id: root.lotNo,
	            text: this.formatLotNodeText(root),
	            type: 'lot',
	            data: root,
	            children: buildHierarchy(root),
	            state: { opened: true }
	        }));
	    }
		
		getLotStatusBadge(status) {
	       const statusMap = {
	           'CREATED': '⚪',  // 흰색 원
	           'PROGRESS': '🔵', // 파란색 원
	           'COMPLETE': '✅', // 체크 마크
	           'DUMMY': '⚫'     // 검은색 원
	       };
	       return statusMap[status] || '⚪';
	   }
		
		formatLotNodeText(lot) {
	        const status = this.getLotStatusBadge(lot.lotStatus);
	        return `${lot.lotNo} - ${lot.productName || '미지정'} ${status}`;
	    }

		async loadLotDetails(lotNo) {
	        try {
	            const response = await fetch(`/api/lot/${lotNo}`);
	            if (!response.ok) throw new Error('LOT 상세 정보 조회 실패');
	            const lotDetail = await response.json();
	            
	            // LOT 상세 정보 업데이트
	            this.updateLotDetails(lotDetail);
	            
	            // 공정 이력 그리드 업데이트
	            this.processHistoryGrid.resetData(lotDetail.processHistory || []);
	            
	            // 품질검사 이력 그리드 업데이트
	            this.qcHistoryGrid.resetData(lotDetail.qcHistory || []);
	            
	            // 계층 구조 하이라이트
	            this.highlightLotHierarchy(lotNo);
	        } catch (error) {
	            console.error('Error loading lot details:', error);
	            this.showErrorMessage('LOT 상세 정보 로드에 실패했습니다.');
	        }
	    }

		highlightLotHierarchy(lotNo) {
	        const node = this.lotTreeView.jstree(true).get_node(lotNo);
	        if (node) {
	            const parents = this.lotTreeView.jstree(true).get_path(node, true);
	            this.lotTreeView.jstree(true).deselect_all(true);
	            parents.forEach(parentId => {
	                this.lotTreeView.jstree(true).select_node(parentId, true);
	            });
	        }
	    }
		
		updateLotDetails(lot) {
	        const statusBadgeClass = {
	            'CREATED': 'status-created',
	            'PROGRESS': 'status-progress',
	            'COMPLETE': 'status-complete'
	        }[lot.lotStatus] || 'status-created';

	        this.lotDetailsView.html(`
	            <div class="lot-info-section">
	                <div class="row">
	                    <div class="col-md-6">
	                        <p><strong>LOT 번호:</strong> ${lot.lotNo}</p>
	                        <p><strong>상위 LOT:</strong> ${lot.parentLotNo === lot.lotNo ? '-' : lot.parentLotNo}</p>
	                        <p><strong>제품명:</strong> ${lot.productName || '-'}</p>
	                        <p><strong>공정:</strong> ${lot.processName || '-'}</p>
	                    </div>
	                    <div class="col-md-6">
	                        <p><strong>작업지시:</strong> ${lot.wiNo || '-'}</p>
	                        <p><strong>상태:</strong> <span class="badge ${statusBadgeClass}">${lot.lotStatus || '-'}</span></p>
	                        <p><strong>시작시간:</strong> ${this.formatDateTime(lot.startTime)}</p>
	                        <p><strong>종료시간:</strong> ${this.formatDateTime(lot.endTime)}</p>
	                    </div>
	                </div>
	            </div>
	        `);
	    }

        renderStatusBadge(status) {
            const statusMap = {
                'CREATED': { text: '생성됨', class: 'status-created' },
                'PROGRESS': { text: '진행중', class: 'status-in-progress' },
                'COMPLETE': { text: '완료', class: 'status-completed' }
            };
            const statusInfo = statusMap[status] || { text: status || '미지정', class: '' };
            return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
        }

        formatDateTime(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString('ko-KR');
        }

        async searchLots() {
            const searchTerm = $('#lotSearchInput').val().trim();
            const productNo = $('#productSelect').val();

            try {
                const lots = await this.fetchLots({ productNo });
                const filteredLots = lots.filter(lot => 
                    lot.lotNo.includes(searchTerm) || 
                    (lot.productName && lot.productName.includes(searchTerm))
                );
                this.renderLotTree(filteredLots);
            } catch (error) {
                console.error('LOT 검색 실패:', error);
                this.showErrorMessage('LOT 검색에 실패했습니다.');
            }
        }

		populateProductSelect(lots) {
            const productSelect = $('#productSelect');
            const uniqueProducts = [...new Set(lots
                .filter(lot => lot.productName)
                .map(lot => ({ 
                    no: lot.productNo, 
                    name: lot.productName 
                }))
                .filter(product => product.name)
                .map(product => JSON.stringify(product))
            )].map(str => JSON.parse(str));

            productSelect.empty();
            productSelect.append('<option value="0">전체 제품</option>');
            
            uniqueProducts.forEach(product => {
                productSelect.append(
                    `<option value="${product.no}">${product.name}</option>`
                );
            });
        }

        showMessage(message) {
            this.lotDetailsView.html(`
                <div class="alert alert-info">
                    ${message}
                </div>
            `);
        }

        showErrorMessage(message) {
            this.lotDetailsView.html(`
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${message}
                </div>
            `);
        }
    }

    // 애플리케이션 초기화
    new LotTrackingApp();
});