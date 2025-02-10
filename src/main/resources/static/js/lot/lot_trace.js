// LOT 상태별 색상 정의
const LOT_STATUS_COLORS = {
    'CREATED': '#e3f2fd',        // 연한 파랑
    'IN_PROCESS': '#fff3e0',     // 연한 주황
    'QC_IN_PROGRESS': '#e8f5e9', // 연한 초록
    'SHIPPED': '#f3e5f5',        // 연한 보라
    'COMPLETED': '#eceff1',      // 연한 회색
    'REJECTED': '#ffebee'        // 연한 빨강
};

// LOT 유형별 아이콘
const LOT_TYPE_ICONS = {
    'P': '🏭', // 공정 LOT
    'Q': '🔍', // 품질검사 LOT
    'S': '📦'  // 출하 LOT
};

// 트리 노드 HTML 생성 함수 수정
function generateTreeHTML(node, direction) {
    if (!node) return '';

    const lotNo = node.data.lotMaster.lotNo;
    const lotType = lotNo.charAt(0);
    const icon = LOT_TYPE_ICONS[lotType] || '📋';
    const statusColor = LOT_STATUS_COLORS[node.data.lotMaster.lotStatus] || '#ffffff';

    let html = `
        <div class="node" style="background-color: ${statusColor}; padding: 10px; border-radius: 5px; margin: 5px;">
            <div class="lot-info">
                <strong>${icon} ${lotNo}</strong>
                <div class="lot-details">
                    <span>공정: ${node.data.lotMaster.processType}</span>
                    <span>상태: ${node.data.lotMaster.lotStatus}</span>
                    <span>수량: ${node.data.inputQuantity || 0} → ${node.data.outputQuantity || 0}</span>
                </div>
            </div>`;

    if (direction === 'backward' && node.parents.length > 0) {
        html += '<ul style="list-style: none; padding-left: 20px;">';
        node.parents.forEach(parent => {
            html += `<li>${generateTreeHTML(parent, direction)}</li>`;
        });
        html += '</ul>';
    }

    if (direction === 'forward' && node.children.length > 0) {
        html += '<ul style="list-style: none; padding-left: 20px;">';
        node.children.forEach(child => {
            html += `<li>${generateTreeHTML(child, direction)}</li>`;
        });
        html += '</ul>';
    }

    html += '</div>';
    return html;
}

// 공정 이력 그리드 컬럼 정의 수정
function initializeProcessGrid() {
    processGrid = new tui.Grid({
        el: document.getElementById('processGrid'),
        scrollX: true,
        scrollY: true,
        columns: [
            {
                header: 'LOT 번호',
                name: 'lotNo',
                width: 150,
                align: 'center',
                formatter: ({value}) => {
                    const icon = LOT_TYPE_ICONS[value.charAt(0)] || '📋';
                    return icon + ' ' + value;
                }
            },
            {
                header: '공정',
                name: 'processNo',
                width: 100,
                align: 'center'
            },
            {
                header: '작업구분',
                name: 'actionType',
                width: 120,
                align: 'center'
            },
            {
                header: '투입수량',
                name: 'inputQty',
                width: 100,
                align: 'right',
                formatter: ({value}) => value ? value.toLocaleString() : ''
            },
            {
                header: '산출수량',
                name: 'outputQty',
                width: 100,
                align: 'right',
                formatter: ({value}) => value ? value.toLocaleString() : ''
            },
            {
                header: '품질검사',
                name: 'qcResult',
                width: 150,
                align: 'center'
            },
            {
				header: '처리시간',
				                name: 'actionTime',
				                width: 150,
				                align: 'center'
				            },
				            {
				                header: '담당자',
				                name: 'createUser',
				                width: 100,
				                align: 'center'
				            },
				            {
				                header: '상태',
				                name: 'lotStatus',
				                width: 120,
				                align: 'center',
				                formatter: ({value}) => {
				                    const color = LOT_STATUS_COLORS[value] || '#ffffff';
				                    return `<span style="background-color: ${color}; padding: 5px; border-radius: 3px;">${value}</span>`;
				                }
				            }
				        ]
				    });
				}

				// LOT 세부 정보 조회
				function showLotDetail(lotNo) {
				    $.ajax({
				        url: `/lot-trace/api/detail/${lotNo}`,
				        type: 'GET',
				        beforeSend: function(xhr) {
				            xhr.setRequestHeader(header, token);
				        },
				        success: function(result) {
				            showLotDetailModal(result);
				        },
				        error: function(xhr) {
				            alert('LOT 상세 정보 조회 중 오류가 발생했습니다.');
				        }
				    });
				}

				// LOT 상세 정보 모달 표시
				function showLotDetailModal(lotDetail) {
				    const modal = `
				    <div class="modal fade" id="lotDetailModal" tabindex="-1">
				        <div class="modal-dialog modal-lg">
				            <div class="modal-content">
				                <div class="modal-header">
				                    <h5 class="modal-title">LOT 상세 정보</h5>
				                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				                </div>
				                <div class="modal-body">
				                    <div class="row mb-3">
				                        <div class="col-md-6">
				                            <strong>LOT 번호:</strong> ${lotDetail.lotNo}
				                        </div>
				                        <div class="col-md-6">
				                            <strong>상태:</strong> ${lotDetail.lotStatus}
				                        </div>
				                    </div>
				                    <div class="row mb-3">
				                        <div class="col-md-6">
				                            <strong>작업계획:</strong> ${lotDetail.planId}
				                        </div>
				                        <div class="col-md-6">
				                            <strong>공정:</strong> ${lotDetail.processType}
				                        </div>
				                    </div>
				                    <div class="row mb-3">
				                        <div class="col-md-6">
				                            <strong>계획수량:</strong> ${lotDetail.planQty}
				                        </div>
				                        <div class="col-md-6">
				                            <strong>현재수량:</strong> ${lotDetail.currQty}
				                        </div>
				                    </div>
				                    
				                    <!-- 품질검사 결과 탭 추가 -->
				                    <ul class="nav nav-tabs" role="tablist">
				                        <li class="nav-item">
				                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#qcHistory">
				                                품질검사 이력
				                            </button>
				                        </li>
				                    </ul>
				                    
				                    <div class="tab-content mt-3">
				                        <div class="tab-pane fade show active" id="qcHistory">
				                            <div id="qcHistoryGrid"></div>
				                        </div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>`;

				    // 기존 모달 제거 후 새로 추가
				    $('#lotDetailModal').remove();
				    $(document.body).append(modal);

				    // 품질검사 이력 그리드 초기화
				    if (lotDetail.qcLogs && lotDetail.qcLogs.length > 0) {
				        initializeQcHistoryGrid(lotDetail.qcLogs);
				    }

				    // 모달 표시
				    new bootstrap.Modal('#lotDetailModal').show();
				}

				// 품질검사 이력 그리드 초기화
				function initializeQcHistoryGrid(qcLogs) {
				    const qcHistoryGrid = new tui.Grid({
				        el: document.getElementById('qcHistoryGrid'),
				        scrollX: true,
				        scrollY: true,
				        columns: [
				            {
				                header: '검사코드',
				                name: 'qcCode',
				                width: 120,
				                align: 'center'
				            },
				            {
				                header: '측정값',
				                name: 'measureValue',
				                width: 100,
				                align: 'right'
				            },
				            {
				                header: '판정',
				                name: 'judgement',
				                width: 100,
				                align: 'center',
				                formatter: ({value}) => {
				                    const color = value === 'OK' ? '#e8f5e9' : '#ffebee';
				                    return `<span style="background-color: ${color}; padding: 5px; border-radius: 3px;">${value}</span>`;
				                }
				            },
				            {
				                header: '검사자',
				                name: 'inspector',
				                width: 100,
				                align: 'center'
				            },
				            {
				                header: '검사시간',
				                name: 'checkTime',
				                width: 150,
				                align: 'center'
				            },
				            {
				                header: '비고',
				                name: 'note',
				                width: 200
				            }
				        ]
				    });

				    qcHistoryGrid.resetData(qcLogs);
				}

				// 트리 노드 클릭 이벤트 처리
				function addTreeNodeClickHandlers() {
				    document.querySelectorAll('.node').forEach(node => {
				        node.addEventListener('click', function(e) {
				            const lotNo = this.querySelector('strong').textContent.trim().split(' ')[1];
				            showLotDetail(lotNo);
				            e.stopPropagation();
				        });
				    });
				}

				// LOT 추적 조회 후 트리 노드 클릭 이벤트 추가
				function updateTreeView(result) {
				    const backwardTree = document.getElementById('backwardTree');
				    backwardTree.innerHTML = generateTreeHTML(result.backwardTree, 'backward');

				    const forwardTree = document.getElementById('forwardTree');
				    forwardTree.innerHTML = generateTreeHTML(result.forwardTree, 'forward');

				    // 트리 노드 클릭 이벤트 핸들러 추가
				    addTreeNodeClickHandlers();
				}