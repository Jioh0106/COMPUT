/**
 * 입고 등록/수정 팝업 관리 모듈
 */

// =============== 전역 변수 선언 ===============
let itemSearchGrid = null;        // 품목 검색 그리드
let warehouseSearchGrid = null;   // 창고 검색 그리드
let inDatePicker = null;          // 입고일자 데이트피커
let selectedItemType = '';        // 선택된 품목 유형

// =============== 초기화 함수 ===============
/**
 * DOMContentLoaded 이벤트 핸들러
 * 페이지 로드 시 필요한 모든 초기화 작업 수행
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeCsrf();      // CSRF 토큰 초기화
    initInboundForm();     // 폼 초기화
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
 * 입고 폼 초기화
 * 데이트피커 및 관련 스타일 설정
 */
function initInboundForm() {
    // 데이트피커 스타일 설정
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
    inDatePicker = new tui.DatePicker('#inDatePicker', {
        language: 'ko',
        date: new Date(),
        type: 'date',
        input: {
            element: '#inDate',
            format: 'yyyy-MM-dd'
        },
        showAlways: false,
        autoClose: true,
        selectableRanges: [
            [new Date(1900, 0, 1), new Date()]
        ]
    });
}

/**
 * 그리드 컬럼 생성 유틸리티 함수
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
 * 그리드 초기화
 * 품목 검색 그리드와 창고 검색 그리드 설정
 */
function initializeGrids() {
    // 품목 검색 그리드 초기화
    itemSearchGrid = new tui.Grid({
        el: document.getElementById('itemSearchGrid'),
        columns: [
            createColumn({header: '품목코드', name: 'item_code'}),
            createColumn({header: '품목명', name: 'item_name', width: 200}),
            createColumn({header: '품목구분', name: 'item_type'})
        ],
        data: [],
        bodyHeight: 250
    });

    // 품목 그리드 클릭 이벤트 설정
    itemSearchGrid.on('click', handleItemGridClick);

    // 창고 검색 그리드 초기화
    warehouseSearchGrid = new tui.Grid({
        el: document.getElementById('warehouseSearchGrid'),
        columns: [
            createColumn({header: '창고ID', name: 'warehouse_id'}),
            createColumn({header: '창고명', name: 'warehouse_name'}),
            createColumn({header: '유형', name: 'warehouse_type'}),
            createColumn({header: '구역', name: 'zone'})
        ],
        data: [],
        bodyHeight: 250
    });

    // 창고 그리드 클릭 이벤트 설정
    warehouseSearchGrid.on('click', handleWarehouseGridClick);
}

// =============== 이벤트 핸들러 ===============
/**
 * 품목 그리드 클릭 이벤트 핸들러
 */
function handleItemGridClick(ev) {
    if (ev.rowKey === undefined) return;
    
    const rowData = itemSearchGrid.getRow(ev.rowKey);
    
    document.getElementById('itemCode').value = parseInt(rowData.item_code);
    document.getElementById('itemName').value = rowData.item_name;
    selectedItemType = rowData.item_type;

    const modal = bootstrap.Modal.getInstance(document.getElementById('itemSearchModal'));
    if (modal) modal.hide();
}

/**
 * 창고 그리드 클릭 이벤트 핸들러
 */
function handleWarehouseGridClick(ev) {
    if (ev.rowKey === undefined) return;
    
    const rowData = warehouseSearchGrid.getRow(ev.rowKey);
    document.getElementById('warehouseCode').value = rowData.warehouse_id;
    document.getElementById('warehouseName').value = rowData.warehouse_name;
    
    loadZones(rowData.warehouse_id);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseSearchModal'));
    if (modal) modal.hide();
}

/**
 * 이벤트 리스너 설정
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

    // 검색 입력창 엔터 키 이벤트
    document.getElementById('itemSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchItems();
        }
    });

    document.getElementById('warehouseSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchWarehouses();
        }
    });
}

// =============== 데이터 처리 함수 ===============
/**
 * URL 파라미터 확인 및 수정 모드 처리
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const inNo = urlParams.get('inNo');
    
    if (inNo) {
        loadInboundData(inNo);
    }
}

/**
 * 입고 데이터 로드 (수정 모드)
 */
function loadInboundData(inNo) {
    fetch(`/api/inbound/${inNo}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                fillFormData(result.data);
            }
        });
}

/**
 * 폼 데이터 채우기
 */
function fillFormData(data) {
    document.getElementById('inNo').value = data.in_no;
    document.getElementById('inDate').value = data.in_date;
    document.getElementById('itemCode').value = data.item_no;
    document.getElementById('itemName').value = data.item_name;
    document.getElementById('inQty').value = data.in_qty;
    document.getElementById('warehouseCode').value = data.warehouse_id;
    document.getElementById('warehouseName').value = data.warehouse_name;
    
    // 구역 정보 로드 및 선택
    loadZones(data.warehouse_id).then(() => {
        const zoneSelect = document.getElementById('zone');
        setTimeout(() => {
            zoneSelect.value = data.zone;
        }, 100);
    });
}

/**
 * 품목 검색
 */
function searchItems() {
    const keyword = document.getElementById('itemSearchInput').value;
    
    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }
    
    fetch(`/api/inbound/search/items?keyword=${encodeURIComponent(keyword)}`, {
        headers: headers
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        const transformedData = data.map(item => ({
            item_code: item.item_code || item.ITEM_CODE,
            item_name: item.item_name || item.ITEM_NAME,
            item_type: item.item_type || item.ITEM_TYPE
        }));
        itemSearchGrid.resetData(transformedData);
    });
}

/**
 * 창고 검색
 */
function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    const itemCode = document.getElementById('itemCode').value;
    
    if (!itemCode) {
        Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
        return;
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }
    
    const url = `/api/inbound/search/warehouses?keyword=${encodeURIComponent(keyword)}&itemNo=${itemCode}&itemType=${encodeURIComponent(selectedItemType)}`;
    
    fetch(url, { headers: headers })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                Swal.fire('알림', '검색 결과가 없습니다.', 'info');
                warehouseSearchGrid.resetData([]);
                return;
            }

            const transformedData = data.map(warehouse => ({
                warehouse_id: warehouse.warehouse_id || warehouse.WAREHOUSE_ID,
                warehouse_name: warehouse.warehouse_name || warehouse.WAREHOUSE_NAME,
                warehouse_type: warehouse.warehouse_type || warehouse.WAREHOUSE_TYPE,
                zone: warehouse.zone || warehouse.ZONE,
                has_existing_item: warehouse.has_existing_item
            }));
            
            warehouseSearchGrid.resetData(transformedData);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('오류', '창고 검색 중 오류가 발생했습니다.', 'error');
        });
}

/**
 * 구역 정보 로드
 */
async function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = true;

    const itemCode = document.getElementById('itemCode').value;
    if (!itemCode || !warehouseCode) {
        zoneSelect.innerHTML = '<option value="">구역 선택</option>';
        zoneSelect.disabled = true;
        return;
    }

    try {
        const response = await fetch(`/api/inbound/warehouse/${warehouseCode}/zones?itemNo=${itemCode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch zones');
        }
        const data = await response.json();
        
        zoneSelect.innerHTML = '<option value="">구역 선택</option>';
        
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(zone => {
                if (zone) {
                    zoneSelect.innerHTML += `<option value="${zone}">${zone}</option>`;
                }
            });
            
            if (data.length === 1) {
                zoneSelect.value = data[0];
            }
        } else {
            zoneSelect.innerHTML = '<option value="">선택 가능한 구역 없음</option>';
            Swal.fire({
                title: '알림',
                text: '해당 창고에 선택 가능한 구역이 없습니다.',
                icon: 'warning'
            });
        }
    } catch (error) {
        console.error('구역 정보 로드 실패:', error);
        zoneSelect.innerHTML = '<option value="">구역 로드 실패</option>';
        Swal.fire({
            title: '오류',
            text: '구역 정보를 불러오는데 실패했습니다.',
            icon: 'error'
        });
    } finally {
        zoneSelect.disabled = false;
    }
}

/**
 * 입고 데이터 저장
 */
function saveInbound() {
    if (!validateForm()) return;

    const inNo = document.getElementById('inNo').value;
    const inboundData = {
        in_no: inNo ? parseInt(inNo) : null,
        item_no: parseInt(document.getElementById('itemCode').value),
        in_date: document.getElementById('inDate').value,
        in_qty: parseInt(document.getElementById('inQty').value),
        warehouse_id: document.getElementById('warehouseCode').value,
        zone: document.getElementById('zone').value,
        status: "대기"
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }

    const url = inNo ? `/api/inbound/update` : '/api/inbound/save';
    const method = inNo ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(inboundData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 부모 창 새로고침
            if (window.opener && !window.opener.closed) {
                window.opener.location.reload();
            }
            
            // 성공 메시지 표시 후 창 닫기
            Swal.fire({
                title: "저장 완료",
                text: data.message,
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    window.close();
                }
            });
        }
    })
    .catch(error => {
        console.error('저장 실패:', error);
        Swal.fire({
            title: '오류',
            text: '데이터 저장 중 오류가 발생했습니다.',
            icon: 'error'
        });
    });
}

/**
 * 폼 유효성 검사
 * @returns {boolean} 유효성 검사 통과 여부
 */
function validateForm() {
    const required = {
        'itemName': '품목을 선택하세요.',
        'inQty': '입고수량을 입력하세요.',
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

// =============== 유틸리티 함수 ===============
/**
 * API 요청을 위한 헤더 생성
 * @returns {Object} 헤더 객체
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
 * 에러 처리 함수
 * @param {Error} error - 발생한 에러
 * @param {string} customMessage - 사용자에게 표시할 메시지
 */
function handleError(error, customMessage) {
    console.error('Error:', error);
    Swal.fire('오류', customMessage, 'error');
}