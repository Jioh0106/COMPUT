// 전역 변수 선언
let itemSearchGrid = null;
let warehouseSearchGrid = null;
let outDatePicker = null;

// DOMContentLoaded 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    // CSRF 토큰 초기화
    initializeCsrf();
    // 폼 초기화
    initOutboundForm();
    // 그리드 초기화
    initializeGrids();
    // 이벤트 리스너 추가
    attachEventListeners();
    // URL 파라미터 체크 (수정 모드)
    checkUrlParameters();
});

// CSRF 토큰 초기화
function initializeCsrf() {
    const csrfMeta = document.querySelector('meta[name="_csrf"]');
    const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
    
    if (csrfMeta && csrfHeaderMeta) {
        window.csrfToken = csrfMeta.content;
        window.csrfHeader = csrfHeaderMeta.content;
    }
}

// URL 파라미터 체크 (수정 모드)
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const outNo = urlParams.get('outNo');
    
    if (outNo) {
        loadOutboundData(outNo);
    }
}

// 출고 데이터 로드 (수정 모드)
function loadOutboundData(outNo) {
    fetch(`/api/outbound/${outNo}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                fillFormData(result.data);
            }
        })
}

// 폼 데이터 채우기
function fillFormData(data) {
    document.getElementById('outNo').value = data.out_no;
    document.getElementById('outDate').value = data.out_date;
    document.getElementById('itemCode').value = data.inventory_no;
    document.getElementById('itemName').value = data.item_name;
    document.getElementById('outQty').value = data.out_qty;
    document.getElementById('warehouseCode').value = data.warehouse_id;
    document.getElementById('warehouseName').value = data.warehouse_name;
	document.getElementById('inventoryQty').value = data.inventory_qty;
	
	// 재고 수량 설정
    document.getElementById('inventoryQty').value = data.inventory_qty;
	 const zoneSelect = document.getElementById('zone');
	 zoneSelect.innerHTML = data.zone ? `<option value="${data.zone}">${data.zone}</option>` : '<option value="">구역 없음</option>';
	 zoneSelect.disabled = !data.zone;
	}    
	
// 폼 초기화
function initOutboundForm() {
    // DatePicker 스타일 추가
    const styleSheet = `
        .tui-datepicker {
            position: absolute;
            z-index: 1060;
            border: 1px solid #ddd;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .tui-datepicker-input {
            position: relative;
        }
        .tui-calendar * {
            font-family: 'Nunito', 'Noto Sans KR', sans-serif;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = styleSheet;
    document.head.appendChild(style);
    
    // 데이트피커 초기화
    outDatePicker = new tui.DatePicker('#outDatePicker', {
        language: 'ko',
        date: new Date(),
        type: 'date',
        input: {
            element: '#outDate',
            format: 'yyyy-MM-dd'
        },
        showAlways: false,
        autoClose: true,
		selectableRanges: [
		  	[new Date(1900, 0, 1), new Date()]
		]
    });
}

	//컬럼 설정
	function createColumn(options) {
	  return {
	    width: options.width,
	    minWidth: options.width,
	    align: 'center',
	    ...options
	  };
	}

// 그리드 초기화
function initializeGrids() {
    // 품목 검색 그리드
    itemSearchGrid = new tui.Grid({
        el: document.getElementById('itemSearchGrid'),
        columns: [
			createColumn({header: '품목코드', name: 'item_code'}),
			createColumn({header: '품목명', name: 'item_name', width: 200}),
			createColumn({header: '재고수량', name: 'inventory_qty'}),
			createColumn({header: '품목구분', name: 'item_type'}),
        ],
        data: [],
        bodyHeight: 250
    });

	// 품목 그리드 클릭 이벤트
	itemSearchGrid.on('click', function(ev) {
	    if (ev.rowKey === undefined) return;
	    const rowData = itemSearchGrid.getRow(ev.rowKey);
	    
	    // 품목 정보와 재고 수량 설정
	    document.getElementById('itemCode').value = rowData.item_code;
	    document.getElementById('itemName').value = rowData.item_name;
	    document.getElementById('inventoryQty').value = rowData.inventory_qty || 0;
	    
	    // 창고 관련 필드 초기화
	    document.getElementById('warehouseCode').value = '';
	    document.getElementById('warehouseName').value = '';
	    document.getElementById('zone').innerHTML = '<option value="">구역 선택</option>';
	    document.getElementById('zone').disabled = true;
	    
	    const modal = bootstrap.Modal.getInstance(document.getElementById('itemSearchModal'));
	    if (modal) modal.hide();
	});

    // 창고 검색 그리드
    warehouseSearchGrid = new tui.Grid({
        el: document.getElementById('warehouseSearchGrid'),
        columns: [
			createColumn({header: '창고ID', name: 'warehouse_id'}),
			createColumn({header: '창고명', name: 'warehouse_name'}),
			createColumn({header: '유형', name: 'warehouse_type'}),
			createColumn({header: '구역', name: 'zone'}),
			createColumn({header: '가용재고', name: 'available_stock'}),
        ],
        data: [],
        bodyHeight: 250
    });

// 창고 그리드 클릭 이벤트
warehouseSearchGrid.on('click', function(ev) {
    if (ev.rowKey === undefined) return;
    const rowData = warehouseSearchGrid.getRow(ev.rowKey);
    
    document.getElementById('warehouseCode').value = rowData.warehouse_id;
    document.getElementById('warehouseName').value = rowData.warehouse_name;
    document.getElementById('availableStock').value = rowData.available_stock;
    
    // 선택된 창고의 구역 정보 설정
    if (rowData.zone) {
        const zoneSelect = document.getElementById('zone');
        zoneSelect.innerHTML = `<option value="${rowData.zone}">${rowData.zone}</option>`;
        zoneSelect.value = rowData.zone;
        zoneSelect.disabled = false;
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseSearchModal'));
    if (modal) modal.hide();
	});
}
// 이벤트 리스너 추가
function attachEventListeners() {
    // 품목 검색 버튼
    document.getElementById('itemSearchBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('itemSearchModal'));
        modal.show();
        document.getElementById('itemSearchModal').addEventListener('shown.bs.modal', function() {
            itemSearchGrid.refreshLayout();
            searchItems();
        }, { once: true });
    });

    // 창고 검색 버튼
    document.getElementById('warehouseSearchBtn').addEventListener('click', function() {
        if (!document.getElementById('itemCode').value) {
            Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('warehouseSearchModal'));
        modal.show();
        document.getElementById('warehouseSearchModal').addEventListener('shown.bs.modal', function() {
            warehouseSearchGrid.refreshLayout();
            searchWarehouses();
        }, { once: true });
    });

	// 출고수량 변경 이벤트
	document.getElementById('outQty').addEventListener('change', function(e) {
	    const qty = parseInt(e.target.value) || 0;
	    const availableStock = parseInt(document.getElementById('availableStock').value) || 0;
	    
	    if (qty > inventoryQty) {
	        Swal.fire('경고', '선택한 창고의 재고수량을 초과할 수 없습니다.', 'warning');
	        e.target.value = inventoryQty;
	    }
	});

    // 검색어 입력 엔터 이벤트
    ['itemSearchInput', 'warehouseSearchInput'].forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                id === 'itemSearchInput' ? searchItems() : searchWarehouses();
            }
        });
    });
}

// 품목 검색
function searchItems() {
    const keyword = document.getElementById('itemSearchInput').value;
    const headers = { 'Content-Type': 'application/json' };
    
    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }
    
    fetch(`/api/outbound/search/items?keyword=${encodeURIComponent(keyword)}`, { headers })
        .then(response => response.json())
        .then(data => {
            // 데이터 변환 로직을 여기서 처리
            const transformedData = data.map(item => ({
                item_code: item.item_code || item.ITEM_CODE,
                item_name: item.item_name || item.ITEM_NAME,
                inventory_qty: item.inventory_qty || item.INVENTORY_QTY,
                item_type: item.item_type || item.ITEM_TYPE
            }));
            itemSearchGrid.resetData(transformedData);
        })
}

// 창고 검색
function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    const itemNo = document.getElementById('itemCode').value;
    
    if (!itemNo) {
        Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
        return;
    }

    const headers = { 
        'Content-Type': 'application/json'
    };
    
    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }
    
    fetch(`/api/outbound/search/warehouses?keyword=${encodeURIComponent(keyword)}&itemNo=${itemNo}`, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 오류가 발생했습니다.');
            }
            return response.json();
        })
        .then(data => {
            const transformedData = data.map(warehouse => ({
                warehouse_id: warehouse.warehouse_id || warehouse.WAREHOUSE_ID,
                warehouse_name: warehouse.warehouse_name || warehouse.WAREHOUSE_NAME,
                warehouse_type: warehouse.warehouse_type || warehouse.WAREHOUSE_TYPE,
                zone: warehouse.zone || warehouse.ZONE,
                available_stock: warehouse.available_stock || warehouse.AVAILABLE_STOCK
            }));
            
            if (transformedData.length === 0) {
                Swal.fire('알림', '해당 품목의 재고가 있는 창고가 없습니다.', 'info');
            }
            
            warehouseSearchGrid.resetData(transformedData);
        })
}

// 구역 로드
async function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = true;

        const response = await fetch(`/api/outbound/warehouse/${warehouseCode}/zones`);
        const data = await response.json();
        
        zoneSelect.innerHTML = '<option value="">구역 선택</option>';
        
        if (Array.isArray(data)) {
            data.forEach(zone => {
                if (zone) {
                    zoneSelect.innerHTML += `<option value="${zone}">${zone}</option>`;
                }
            });
        }
        
        if (zoneSelect.options.length === 1) {
            zoneSelect.innerHTML = '<option value="">구역 없음</option>';
        }
        
        zoneSelect.disabled = false;
        
    } 


// 저장
function saveOutbound() {
    if (!validateForm()) return;

    const outboundData = {
        out_no: document.getElementById('outNo').value || null,
        inventory_no: parseInt(document.getElementById('itemCode').value),
        out_date: document.getElementById('outDate').value,
        out_qty: parseInt(document.getElementById('outQty').value),
        warehouse_id: document.getElementById('warehouseCode').value,
        zone: document.getElementById('zone').value || null,
        status: "대기"
    };
	
	// 수정 모드인 경우 out_no 추가
    const outNo = document.getElementById('outNo').value;
    if (outNo) {
        outboundData.out_no = parseInt(outNo);
    }
	
    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }

    // 수정 모드일 경우 update API를, 아닐 경우 save API를 사용
    const url = outboundData.out_no ? `/api/outbound/update` : '/api/outbound/save';
    const method = outboundData.out_no ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(outboundData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (window.opener && !window.opener.closed) {
                window.opener.location.reload();
            }
            
            Swal.fire({
                title: "저장 완료",
                text: data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.close();
            });
        }
    })
}

// 폼 유효성 검사
function validateForm() {
    const required = {
        'itemName': '품목을 선택하세요.',
        'outQty': '출고수량을 입력하세요.',
        'warehouseName': '창고를 선택하세요.',
        'zone': '구역을 선택하세요.'
    };

    for (let [id, message] of Object.entries(required)) {
        const value = document.getElementById(id).value;
        if (!value) {
            Swal.fire('확인', message, 'warning');
            return false;
        }
    }

    // 출고수량 체크
    const outQty = parseInt(document.getElementById('outQty').value) || 0;
    const availableStock = parseInt(document.getElementById('inventoryQty').value) || 0;

    if (outQty <= 0) {
        Swal.fire('확인', '출고수량은 0보다 커야 합니다.', 'warning');
        return false;
    }

    if (outQty > availableStock) {
        Swal.fire('확인', '재고수량을 초과할 수 없습니다.', 'warning');
        return false;
    }

    return true;
}

// 일괄 완료 처리
function bulkComplete() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '완료 처리할 출고 정보를 선택해 주세요.', 'info');
            return;
        }

        const outNos = selectedRows.map(row => row.out_no);
        
        Swal.fire({
            title: '출고 완료',
            text: `선택한 ${selectedRows.length}건의 출고를 완료 처리하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
                const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

                fetch('/api/outbound/complete', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: JSON.stringify({
                        outNos: outNos
                    })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire({
                            title: '완료',
                            text: result.message,
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            const completeTab = document.querySelector('#complete-tab');
                            if (completeTab) {
                                const tab = new bootstrap.Tab(completeTab);
                                tab.show();
                                setTimeout(() => {
                                    search();
                                }, 100);
                            }
                        });
                    } else {
                        throw new Error(result.message || '완료 처리에 실패했습니다.');
                    }
                })
            }
        });
    } 

// 검색 기능
function search() {
        const searchInput = document.getElementById('searchInput')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const activeTab = document.querySelector('.nav-link.active')?.id;
        const status = activeTab === 'pending-tab' ? '대기' : '완료';

        const params = new URLSearchParams({
            startDate: startDate,
            endDate: endDate,
            keyword: searchInput,
            status: status
        });

        fetch(`/api/outbound/list?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('데이터 조회 요청이 실패했습니다.');
                }
                return response.json();
            })
            .then(result => {
                if (result.data) {
                    const grid = status === '대기' ? pendingGrid : completeGrid;
                    if (grid) {
                        grid.refreshLayout();
                        grid.resetData(result.data);
                        updateButtonsState();
                    }
                } else {
                    throw new Error('데이터 조회 결과가 없습니다.');
                }
            })
}

// 탭 이벤트 초기화
function initializeTabEvents() {
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            const bsTab = new bootstrap.Tab(tab);
            tab.removeEventListener('shown.bs.tab', null);
        });

        const mainTab = document.getElementById('mainTab');
        if (mainTab) {
            mainTab.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', () => {
                    initializeGrids();
                    search();
                });
            });
        }
}

// 버튼 이벤트 바인딩
function bindButtonEvents() {
        // 수정 버튼
        const modifyBtn = document.getElementById('modifyBtn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', modify);
        }

        // 삭제 버튼
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', deleteOutbounds);
        }

        // 검색 버튼
        const searchBtn = document.querySelector('.search-container .btn-primary');
        if (searchBtn) {
            searchBtn.addEventListener('click', search);
        }

        // 일괄 완료 처리 버튼
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', bulkComplete);
        }

        // 출고등록 버튼
        const outboundBtn = document.querySelector('.buttons .btn-primary');
        if (outboundBtn) {
            outboundBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openOutboundRegistration();
            });
        }

        // 검색창 엔터키 이벤트
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    search();
                }
            });
        }
}

// 초기화 및 이벤트 바인딩
function initialize() {
        initializeDatePickers();
        initializeGrids();
        bindButtonEvents();
        initializeTabEvents();

        // 초기 데이터 로드
        search();

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            if (pendingGrid) pendingGrid.refreshLayout();
            if (completeGrid) completeGrid.refreshLayout();
        });
}

// 초기화 실행
$(document).ready(function() {
    initialize();
});
