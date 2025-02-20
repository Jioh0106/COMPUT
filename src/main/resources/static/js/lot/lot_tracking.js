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
            this.lotHierarchyView = $('#lotHierarchyView');
            this.isForward = true; // 정방향/역방향 상태 관리

            // 그리드 초기화
            this.processHistoryGrid = new tui.Grid({
                el: document.getElementById('processHistoryGrid'),
                scrollX: false,
                scrollY: false,
                minBodyHeight: 200,
                columns: [
                    { header: '공정명', name: 'processName', align: 'center', width: 150 },
                    { header: '작업구분', name: 'actionType', align: 'center', width: 100 },
                    { header: '투입수량', name: 'inputQty', align: 'right', width: 100 },
                    { header: '산출수량', name: 'outputQty', align: 'right', width: 100 },
                    { header: '작업자', name: 'createUser', align: 'center', width: 100 },
                    { 
                        header: '작업시간', 
                        name: 'createTime',
                        align: 'center',
                        width: 150,
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
                    { header: '품질검사명', name: 'qcName', align: 'center', width: 150 },
                    { header: '측정값', name: 'measureValue', align: 'right', width: 100 },
                    { 
                        header: '판정', 
                        name: 'judgement',
                        align: 'center',
                        width: 100,
                        formatter: ({value}) => {
                            return value === 'Y' ? 
                                '<span class="badge bg-success">합격</span>' : 
                                '<span class="badge bg-danger">불합격</span>';
                        }
                    },
                    { header: '검사자', name: 'inspector', align: 'center', width: 100 },
                    { 
                        header: '검사시간', 
                        name: 'checkTime',
                        align: 'center',
                        width: 150,
                        formatter: ({value}) => value ? new Date(value).toLocaleString('ko-KR') : '-'
                    }
                ]
            });
        }

        setupEventListeners() {
            $('#searchButton').on('click', () => this.searchLots());
            $('#lotSearchInput').on('keyup', _.debounce(() => this.searchLots(), 300));
            $('#directionToggleBtn').on('click', () => this.toggleDirection());
            $('#productSelect').on('change', () => this.searchLots());
        }

        toggleDirection() {
            this.isForward = !this.isForward;
            $('#directionToggleBtn').text(this.isForward ? '정방향' : '역방향');
            // 현재 선택된 LOT가 있다면 다시 로드
            const selectedNode = this.lotTreeView.jstree(true).get_selected()[0];
            if (selectedNode) {
                this.loadLotDetails(selectedNode);
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
            const defaultParams = { productNo: $('#productSelect').val() || 0 };
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
		                icons: true,
		                variant: 'large'
		            },
		            data: treeData
		        },
		        types: {
		            default: {
		                icon: 'bi bi-diagram-3'
		            }
		        },
		        plugins: ['types', 'wholerow', 'search', 'state']
		    }).on('select_node.jstree', async (e, data) => {
		        if (data.node.original && data.node.original.lotNo) {
		            await this.loadLotDetails(data.node.original.lotNo);
		        }
		    });
		}

		transformLotsToTreeData(lots) {
		    const rootLots = lots.filter(lot => lot.lotNo === lot.parentLotNo);
		    const otherLots = lots.filter(lot => lot.lotNo !== lot.parentLotNo);
		    
		    const buildHierarchy = (parentLot) => {
		        const children = otherLots.filter(lot => lot.parentLotNo === parentLot.lotNo);
		        return children.map(child => ({
		            text: `${child.lotNo} - ${child.productName || '미지정'}`,
		            icon: this.getLotStatusIcon(child.processType),
		            lotNo: child.lotNo,
		            data: child,  // 원본 데이터 보존
		            children: buildHierarchy(child)
		        }));
		    };

		    return rootLots.map(root => ({
		        text: `${root.lotNo} - ${root.productName || '미지정'}`,
		        icon: this.getLotStatusIcon(root.processType),
		        lotNo: root.lotNo,
		        data: root,  // 원본 데이터 보존
		        children: buildHierarchy(root),
		        state: { opened: true }
		    }));
		}
		
		async showLotDetails(lot) {
		    try {
		        await this.loadLotDetails(lot.lotNo);
		    } catch (error) {
		        console.error('Error showing lot details:', error);
		        this.showErrorMessage('LOT 상세 정보 표시에 실패했습니다.');
		    }
		}

        formatLotNodeText(lot) {
            const statusEmoji = this.getLotStatusEmoji(lot.processType);
            return `${statusEmoji} ${lot.lotNo} - ${lot.productName || '미지정'} (${lot.processType || '미지정'})`;
        }

		getLotStatusEmoji(processType) {
		    const iconMap = {
		        'PRTP001': 'bi bi-gear',         // 공정
		        'PRTP002': 'bi bi-tools',        // 조립
		        'PRTP003': 'bi bi-fire',         // 열처리
		        'QRTP001': 'bi bi-search',       // 품질검사
		        'IRTP001': 'bi bi-box-arrow-in-down',  // 입고
		        'ORTP001': 'bi bi-box-arrow-up'  // 출고
		    };
		    return `<i class="${iconMap[processType] || 'bi bi-question-circle'}"></i>`;
		}

        getLotStatusIcon(processType) {
            const iconMap = {
                '조립': 'bi bi-tools',
                '가공': 'bi bi-gear',
                '열처리': 'bi bi-fire',
                '품질검사': 'bi bi-search',
                '입고': 'bi bi-box-arrow-in-down',
                '출고': 'bi bi-box-arrow-up'
            };
            return iconMap[processType] || 'bi bi-question-circle';
        }

		renderHierarchyView(lotData) {
		    const container = this.lotHierarchyView;
		    container.empty();

		    if (!lotData) {
		        container.html('<div class="text-center p-4">데이터가 없습니다.</div>');
		        return;
		    }

		    const createLotCard = (lot) => {
		        const processClass = this.getLotStatusClass(lot.processType);
		        return $(`
		            <div class="lot-card ${processClass}" data-lot-no="${lot.lotNo}">
		                <div class="lot-card-header">
		                    ${lot.lotNo}
		                </div>
		                <div class="lot-card-body">
		                    <div class="mb-1">
		                        <strong>제품:</strong> ${lot.productName || '미지정'}
		                    </div>
		                    <div>
		                        <strong>공정:</strong> ${lot.processName || '미지정'}
		                    </div>
		                    <div class="mt-1">
		                        <strong>상태:</strong> 
		                        <span class="badge ${this.getStatusBadgeClass(lot.lotStatus)}">
		                            ${lot.statusName || lot.lotStatus || '미지정'}
		                        </span>
		                    </div>
		                </div>
		            </div>
		        `).on('click', () => this.showLotDetails(lot));
		    };

		    const renderHierarchy = (lot, level = 0) => {
		        const wrapper = $('<div class="hierarchy-level"></div>');
		        wrapper.append(createLotCard(lot));

		        if (lot.children && lot.children.length > 0) {
		            const childrenWrapper = $('<div class="children-wrapper"></div>');
		            lot.children.forEach(child => {
		                childrenWrapper.append(renderHierarchy(child, level + 1));
		            });
		            wrapper.append(childrenWrapper);
		        }

		        return wrapper;
		    };

		    container.append(renderHierarchy(lotData));
		}
		
		// 계층 구조 역방향 변환 함수 추가
		reverseHierarchy(lot) {
		    const reversedLot = { ...lot };
		    if (reversedLot.children && reversedLot.children.length > 0) {
		        reversedLot.children = reversedLot.children.map(child => this.reverseHierarchy(child));
		        reversedLot.children.reverse();
		    }
		    return reversedLot;
		}

		getStatusBadgeClass(status) {
		    const classMap = {
		        'LST001': 'bg-info text-white', // 생성
		        'LST002': 'bg-primary text-white', // 진행중
		        'LST003': 'bg-success text-white', // 완료
		        'LST004': 'bg-warning text-dark', // 보류
		        'LST005': 'bg-danger text-white',  // 취소
		        'LST006': 'bg-primary text-white',  // 취소
		        'LST007': 'bg-success text-white'  // 취소
		    };
		    return classMap[status] || 'bg-secondary text-white';
		}

        getLotStatusClass(processType) {
            const classMap = {
                '조립': 'process-assembly',
                '가공': 'process-machining',
                '열처리': 'process-heat',
                '품질검사': 'process-qc',
                '입고': 'process-in',
                '출고': 'process-out'
            };
            return classMap[processType] || 'process-unknown';
        }

        async loadLotDetails(lotNo) {
            try {
                const response = await fetch(`/api/lot/${lotNo}`);
                if (!response.ok) throw new Error('LOT 상세 정보 조회 실패');
                const lotDetail = await response.json();
                
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
		    const statusBadgeClass = {
		        'LST001': 'status-created',
		        'LST002': 'status-progress',
		        'LST003': 'status-complete'
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
		                    <p><strong>상태:</strong> <span class="badge ${statusBadgeClass}">${lot.statusName || lot.lotStatus || '-'}</span></p>
		                    <p><strong>시작시간:</strong> ${this.formatDateTime(lot.startTime)}</p>
		                    <p><strong>종료시간:</strong> ${this.formatDateTime(lot.endTime)}</p>
		                </div>
		            </div>
		        </div>
		    `);
		}

        formatDateTime(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString('ko-KR');
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