document.addEventListener('DOMContentLoaded', function() {
    class LotTrackingController {
        constructor() {
            this.workOrderManager = new WorkOrderManager(this);
            this.lotTreeManager = new LotTreeManager(this);
            this.gridManager = new GridManager(this);
            this.setupEventListeners();
        }

        setupEventListeners() {
            $('#searchBtn').on('click', () => this.handleSearch());
        }

        handleSearch() {
            const searchParams = {
                wiNo: $('#searchWiNo').val(),
                lotNo: $('#searchLotNo').val(),
                productNo: $('#searchProduct').val()
            };
            console.log('Search params:', searchParams);
            
            this.workOrderManager.updateWorkOrders();
        }

        // 작업지시 선택 시 호출
        handleWorkOrderSelect(workOrderData) {
            this.lotTreeManager.updateLotTree(workOrderData);
            this.gridManager.updateGrid(workOrderData);
        }
    }

    class WorkOrderManager {
        constructor(controller) {
            this.controller = controller;
            this.container = $('#workOrderTree');
            this.initialize();
        }

        initialize() {
            this.updateWorkOrders();
            this.addEventListeners();
        }

        updateWorkOrders() {
            // 테스트 데이터
            const workOrders = [
                {
                    id: 'wo1',
                    title: '작업지시 WO2024001',
                    product: '금형A',
                    date: '2024-02-18',
                    status: 'progress'
                },
                {
                    id: 'wo2',
                    title: '작업지시 WO2024002',
                    product: '금형B',
                    date: '2024-02-18',
                    status: 'pending'
                }
            ];

            this.container.empty();
            workOrders.forEach(wo => {
                this.container.append(this.createWorkOrderItem(wo));
            });
        }

        createWorkOrderItem(workOrder) {
            return `
                <div class="work-order-item" data-id="${workOrder.id}">
                    <div class="item-header">
                        <i class="bi bi-file-text"></i>
                        <span class="item-title">${workOrder.title}</span>
                    </div>
                    <div class="item-info">
                        <div>제품: ${workOrder.product}</div>
                        <div>작업일: ${workOrder.date}</div>
                    </div>
                </div>
            `;
        }

        addEventListeners() {
            this.container.on('click', '.work-order-item', (e) => {
                const item = $(e.currentTarget);
                $('.work-order-item.selected').removeClass('selected');
                item.addClass('selected');

                const workOrderId = item.data('id');
                this.controller.handleWorkOrderSelect({
                    id: workOrderId,
                    title: item.find('.item-title').text()
                });
            });
        }
    }

    class LotTreeManager {
        constructor(controller) {
            this.controller = controller;
            this.container = $('#lotTree');
        }

        updateLotTree(workOrderData) {
            // 선택된 작업지시에 대한 LOT 트리 데이터
            const lotData = [
                {
                    id: 'wi001',
                    title: '작업지시',
                    lotNo: 'W2024001',
                    status: 'complete',
                    worker: '홍길동',
                    date: '2024-02-18 09:00'
                },
                {
                    id: 'p001',
                    title: '가공공정',
                    lotNo: 'L2024001',
                    status: 'progress',
                    worker: '김가공',
                    date: '2024-02-18 10:00'
                },
                {
                    id: 'q001',
                    title: '품질검사',
                    lotNo: 'Q2024001',
                    status: 'pending',
                    worker: '이검사',
                    date: '2024-02-18 11:00'
                }
            ];

            this.container.empty();
            lotData.forEach(lot => {
                this.container.append(this.createLotNode(lot));
            });
        }

        createLotNode(lot) {
            return `
                <div class="lot-node" data-id="${lot.id}">
                    <div class="lot-title">
                        <i class="bi ${this.getNodeIcon(lot.title)} me-2"></i>
                        ${lot.title}
                    </div>
                    <div class="lot-info">
                        <div>${lot.lotNo}</div>
                        <div>${lot.worker}</div>
                        <div>${lot.date}</div>
                    </div>
                    <div class="lot-status ${lot.status}">
                        ${this.getStatusText(lot.status)}
                    </div>
                </div>
            `;
        }

        getNodeIcon(title) {
            const iconMap = {
                '작업지시': 'bi-file-text',
                '가공공정': 'bi-gear',
                '품질검사': 'bi-clipboard-check'
            };
            return iconMap[title] || 'bi-circle';
        }

        getStatusText(status) {
            const statusMap = {
                'complete': '완료',
                'progress': '진행중',
                'pending': '대기'
            };
            return statusMap[status] || status;
        }
    }

    class GridManager {
        constructor(controller) {
            this.controller = controller;
            this.initialize();
        }

        initialize() {
            this.grid = new tui.Grid({
                el: document.getElementById('historyGrid'),
                scrollX: true,
                scrollY: true,
                rowHeaders: ['rowNum'],
                columns: [
                    {
                        header: '처리시간',
                        name: 'processTime',
                        width: 150,
                        align: 'center'
                    },
                    {
                        header: '공정명',
                        name: 'processName',
                        width: 120
                    },
                    {
                        header: 'LOT번호',
                        name: 'lotNo',
                        width: 120,
                        align: 'center'
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
                        formatter: ({value}) => {
                            const statusMap = {
                                'complete': { text: '완료', class: 'complete' },
                                'progress': { text: '진행중', class: 'progress' },
                                'pending': { text: '대기', class: 'pending' }
                            };
                            const status = statusMap[value] || { text: value, class: '' };
                            return `<span class="lot-status ${status.class}">${status.text}</span>`;
                        }
                    }
                ]
            });
        }

        updateGrid(workOrderData) {
            // 선택된 작업지시에 대한 이력 데이터
            const historyData = [
                {
                    processTime: '2024-02-18 09:00:00',
                    processName: '작업지시',
                    lotNo: 'W2024001',
                    worker: '홍길동',
                    status: 'complete'
                },
                {
                    processTime: '2024-02-18 10:00:00',
                    processName: '가공공정',
                    lotNo: 'L2024001',
                    worker: '김가공',
                    status: 'progress'
                }
            ];

            this.grid.resetData(historyData);
        }
    }

    // 컨트롤러 초기화
    window.controller = new LotTrackingController();
});