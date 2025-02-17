/**
 * 출고 등록/수정 팝업 관리 모듈
 */

// =============== 전역 변수 선언 ===============
let itemSearchGrid = null;        // 품목 검색 그리드
let warehouseSearchGrid = null;   // 창고 검색 그리드
let outDatePicker = null;         // 출고일자 데이트피커

// =============== 초기화 함수 ===============
/**
 * DOMContentLoaded 이벤트 핸들러
 * 페이지 로드 시 필요한 모든 초기화 작업 수행
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeCsrf();      // CSRF 토큰 초기화
    initOutboundForm();    // 폼 초기화
    initializeGrids();     // 그리드 초기화
    attachEventListeners(); // 이벤트 리스너 추가
    checkUrlParameters();   // URL 파라미터 체크 (수정 모드)
});

/**
 * CSRF 토큰 초기화
 * 보안을 위한 CSRF 토큰 설정
 */
function initializeCsrf() {
    const csrfMeta = document.querySelector('meta[name="_csrf"]');
    const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
    
    if (csrfMeta && csrfHeaderMeta) {
        window.csrfToken = csrfMeta.content;
        window.csrfHeader = csrfHeaderMeta.content;
    }
}

/**
 * 출고 폼 초기화
 * DatePicker 및 관련 스타일 설정
 */
function initOutboundForm() {
    // DatePicker 스타일 설정
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

// =============== 유틸리티 함수 ===============
/**
 * 그리드 컬럼 생성 헬퍼 함수
 */
function createColumn(options) {
    return {
        width: options.width,
        minWidth: options.width,
        align: 'center',
        ...options
    };
}

/**
 * URL 파라미터 체크 및 수정 모드 처리
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const outNo = urlParams.get('outNo');
    
    if (outNo) {
        loadOutboundData(outNo);
    }
}

// =============== 그리드 관련 함수 ===============
/**
 * 그리드 초기화 및 설정
 * 품목 검색 그리드와 창고 검색 그리드를 초기화하고 이벤트를 설정
 */
function initializeGrids() {
    initializeItemSearchGrid();
    initializeWarehouseSearchGrid();
}

/**
 * 품목 검색 그리드 초기화
 */
function initializeItemSearchGrid() {
    itemSearchGrid = new tui.Grid({
        el: document.getElementById('itemSearchGrid'),
        columns: [
            createColumn({header: '품목코드', name: 'item_code'}),
            createColumn({header: '품목명', name: 'item_name', width: 200}),
            createColumn({header: '재고수량', name: 'inventory_qty'}),
            createColumn({header: '품목구분', name: 'item_type'})
        ],
        data: [],
        bodyHeight: 250
    });

    // 품목 그리드 클릭 이벤트
    itemSearchGrid.on('click', handleItemGridClick);
}

/**
 * 창고 검색 그리드 초기화
 */
function initializeWarehouseSearchGrid() {
    warehouseSearchGrid = new tui.Grid({
        el: document.getElementById('warehouseSearchGrid'),
        columns: [
            createColumn({header: '창고ID', name: 'warehouse_id'}),
            createColumn({header: '창고명', name: 'warehouse_name'}),
            createColumn({header: '유형', name: 'warehouse_type'}),
            createColumn({header: '구역', name: 'zone'}),
            createColumn({header: '가용재고', name: 'available_stock'})
        ],
        data: [],
        bodyHeight: 250
    });

    // 창고 그리드 클릭 이벤트
    warehouseSearchGrid.on('click', handleWarehouseGridClick);
}

// =============== 이벤트 핸들러 ===============
/**
 * 품목 그리드 클릭 이벤트 핸들러
 */
function handleItemGridClick(ev) {
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
}

/**
 * 창고 그리드 클릭 이벤트 핸들러
 */
function handleWarehouseGridClick(ev) {
    if (ev.rowKey === undefined) return;
    const rowData = warehouseSearchGrid.getRow(ev.rowKey);
    
    // 창고 정보 설정
    document.getElementById('warehouseCode').value = rowData.warehouse_id;
    document.getElementById('warehouseName').value = rowData.warehouse_name;
    document.getElementById('availableStock').value = rowData.available_stock;
    document.getElementById('inventoryQty').value = rowData.available_stock;
    
    // 구역 정보 설정
    if (rowData.zone) {
        const zoneSelect = document.getElementById('zone');
        zoneSelect.innerHTML = `<option value="${rowData.zone}">${rowData.zone}</option>`;
        zoneSelect.value = rowData.zone;
        zoneSelect.disabled = false;
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseSearchModal'));
    if (modal) modal.hide();
}

/**
 * 이벤트 리스너 설정
 * 모든 버튼과 입력 필드에 대한 이벤트를 설정
 */
function attachEventListeners() {
    // 품목 검색 모달 이벤트
    document.getElementById('itemSearchBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('itemSearchModal'));
        modal.show();
        document.getElementById('itemSearchModal').addEventListener('shown.bs.modal', function() {
            itemSearchGrid.refreshLayout();
            searchItems();
        }, { once: true });
    });

    // 창고 검색 모달 이벤트
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
    document.getElementById('outQty').addEventListener('change', handleOutQtyChange);

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

/**
 * 출고수량 변경 이벤트 핸들러
 */
function handleOutQtyChange(e) {
    const qty = parseInt(e.target.value) || 0;
    const inventoryQty = parseInt(document.getElementById('inventoryQty').value) || 0;
    
    if (qty > inventoryQty) {
        Swal.fire('경고', '선택한 창고의 재고수량을 초과할 수 없습니다.', 'warning');
        e.target.value = inventoryQty;
    }
}

// =============== API 호출 함수 ===============
/**
 * 품목 검색 API 호출
 */
function searchItems() {
    const keyword = document.getElementById('itemSearchInput').value;
    const headers = createHeaders();
    
    fetch(`/api/outbound/search/items?keyword=${encodeURIComponent(keyword)}`, { headers })
        .then(response => response.json())
        .then(data => {
            const transformedData = transformItemData(data);
            itemSearchGrid.resetData(transformedData);
        });
}

/**
 * 창고 검색 API 호출
 */
function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    const itemNo = document.getElementById('itemCode').value;
    
    if (!itemNo) {
        Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
        return;
    }

    const headers = createHeaders();
    
    fetch(`/api/outbound/search/warehouses?keyword=${encodeURIComponent(keyword)}&itemNo=${itemNo}`, { headers })
        .then(response => {
            if (!response.ok) throw new Error('서버 오류가 발생했습니다.');
            return response.json();
        })
        .then(data => {
            const transformedData = transformWarehouseData(data);
            
            if (transformedData.length === 0) {
                Swal.fire('알림', '해당 품목의 재고가 있는 창고가 없습니다.', 'info');
            }
            
            warehouseSearchGrid.resetData(transformedData);
        });
}

/**
 * 출고 데이터 저장 API 호출
 */
function saveOutbound() {
    if (!validateForm()) return;

    const outboundData = createOutboundData();
    const headers = createHeaders();
    const { url, method } = getApiConfig(outboundData.out_no);

    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(outboundData)
    })
    .then(handleResponse)
    .then(handleSaveSuccess)
    .catch(handleSaveError);
}

// =============== 유틸리티 함수 ===============
/**
 * API 요청용 헤더 생성
 */
function createHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }

    return headers;
}

/**
 * 품목 데이터 변환
 */
function transformItemData(data) {
    return data.map(item => ({
        item_code: item.item_code || item.ITEM_CODE,
        item_name: item.item_name || item.ITEM_NAME,
        inventory_qty: item.inventory_qty || item.INVENTORY_QTY,
        item_type: item.item_type || item.ITEM_TYPE
    }));
}

/**
 * 창고 데이터 변환
 */
function transformWarehouseData(data) {
    return data.map(warehouse => ({
        warehouse_id: warehouse.warehouse_id || warehouse.WAREHOUSE_ID,
        warehouse_name: warehouse.warehouse_name || warehouse.WAREHOUSE_NAME,
        warehouse_type: warehouse.warehouse_type || warehouse.WAREHOUSE_TYPE,
        zone: warehouse.zone || warehouse.ZONE,
        available_stock: warehouse.available_stock || warehouse.AVAILABLE_STOCK
    }));
}

/**
 * 출고 데이터 객체 생성
 */
function createOutboundData() {
    const outNo = document.getElementById('outNo').value;
    return {
        out_no: outNo ? parseInt(outNo) : null,
        item_no: parseInt(document.getElementById('itemCode').value),
        out_date: document.getElementById('outDate').value,
        out_qty: parseInt(document.getElementById('outQty').value),
        warehouse_id: document.getElementById('warehouseCode').value,
        zone: document.getElementById('zone').value || null,
        status: "대기"
    };
}

/**
 * API 설정 정보 반환
 */
function getApiConfig(outNo) {
    return {
        url: outNo ? '/api/outbound/update' : '/api/outbound/save',
		method: outNo ? 'PUT' : 'POST'
		    };
		}

/**
 * API 응답 처리
 */
function handleResponse(response) {
    if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
    }
    return response.json();
}

/**
 * 저장 성공 처리
 */
function handleSaveSuccess(data) {
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
}

/**
 * 저장 실패 처리
 */
function handleSaveError(error) {
    console.error('저장 실패:', error);
    Swal.fire('오류', error.message || '저장 중 오류가 발생했습니다.', 'error');
}

// =============== 유효성 검사 함수 ===============
/**
 * 폼 유효성 검사
 * @returns {boolean} 유효성 검사 통과 여부
 */
function validateForm() {
    if (!validateRequiredFields()) return false;
    if (!validateQuantity()) return false;
    return true;
}

/**
 * 필수 필드 유효성 검사
 */
function validateRequiredFields() {
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
    return true;
}

/**
 * 수량 유효성 검사
 */
function validateQuantity() {
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

// =============== 데이터 로드 함수 ===============
/**
 * 출고 데이터 로드 (수정 모드)
 */
function loadOutboundData(outNo) {
    fetch(`/api/outbound/${outNo}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                fillFormData(result.data);
            }
        })
        .catch(error => {
            console.error('데이터 로드 실패:', error);
            Swal.fire('오류', '데이터를 불러오는데 실패했습니다.', 'error');
        });
}

/**
 * 폼 데이터 채우기
 */
function fillFormData(data) {
    // 기본 필드 설정
    document.getElementById('outNo').value = data.out_no;
    document.getElementById('outDate').value = data.out_date;
    document.getElementById('itemCode').value = data.item_no;
    document.getElementById('itemName').value = data.item_name;
    document.getElementById('outQty').value = data.out_qty;
    document.getElementById('warehouseCode').value = data.warehouse_id;
    document.getElementById('warehouseName').value = data.warehouse_name;
    document.getElementById('inventoryQty').value = data.inventory_qty;

    // 구역 정보 설정
    const zoneSelect = document.getElementById('zone');
    zoneSelect.innerHTML = data.zone ? 
        `<option value="${data.zone}">${data.zone}</option>` : 
        '<option value="">구역 없음</option>';
    zoneSelect.disabled = !data.zone;
}

/**
 * 구역 정보 로드
 */
async function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = true;

    try {
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
    } catch (error) {
        console.error('구역 정보 로드 실패:', error);
        zoneSelect.innerHTML = '<option value="">구역 로드 실패</option>';
    } finally {
        zoneSelect.disabled = false;
    }
}

// =============== 이벤트 핸들러 함수 ===============
/**
 * 일괄 완료 처리
 */
function bulkComplete() {
    const selectedRows = pendingGrid.getCheckedRows();
    if (selectedRows.length === 0) {
        Swal.fire('알림', '완료 처리할 출고 정보를 선택해 주세요.', 'info');
        return;
    }

    const outNos = selectedRows.map(row => row.out_no);
    
    confirmBulkComplete(outNos, selectedRows.length);
}

/**
 * 일괄 완료 확인 대화상자 표시
 */
function confirmBulkComplete(outNos, count) {
    Swal.fire({
        title: '출고 완료',
        text: `선택한 ${count}건의 출고를 완료 처리하시겠습니까?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            processBulkComplete(outNos);
        }
    });
}

/**
 * 일괄 완료 처리 API 호출
 */
function processBulkComplete(outNos) {
    const headers = createHeaders();
    
    fetch('/api/outbound/complete', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ outNos: outNos })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            handleBulkCompleteSuccess(result.message);
        } else {
            throw new Error(result.message || '완료 처리에 실패했습니다.');
        }
    })
    .catch(error => handleBulkCompleteError(error));
}

/**
 * 일괄 완료 성공 처리
 */
function handleBulkCompleteSuccess(message) {
    Swal.fire({
        title: '완료',
        text: message,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        const completeTab = document.querySelector('#complete-tab');
        if (completeTab) {
            const tab = new bootstrap.Tab(completeTab);
            tab.show();
            setTimeout(() => search(), 100);
        }
    });
}

/**
 * 일괄 완료 실패 처리
 */
function handleBulkCompleteError(error) {
    console.error('일괄 완료 처리 실패:', error);
    Swal.fire('오류', error.message || '완료 처리 중 오류가 발생했습니다.', 'error');
}