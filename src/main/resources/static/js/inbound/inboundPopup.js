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
 * 페이지 초기화 메인 함수
 */
function initializePage() {
    try {
        initializeCsrf();              // CSRF 토큰 초기화
        initInboundForm();             // 폼 초기화
        setupModalEvents();            // 모달 이벤트 설정
        attachEventListeners();        // 이벤트 리스너 추가
        bindSourceSelectEvents();      // 출처 선택 이벤트 바인딩
        checkUrlParameters();          // URL 파라미터 체크 (수정 모드)
    } catch (error) {
        handleError(error, '페이지 초기화 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 초기화 트리거
document.addEventListener('DOMContentLoaded', initializePage);

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
 * @param {Object} options - 컬럼 옵션
 * @returns {Object} 생성된 컬럼 객체
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
 * 품목 검색 모달 관련 함수
 */
function setupItemSearchModal() {
    // 이미 그리드가 초기화되어 있는 경우 재사용
    if (!itemSearchGrid && document.getElementById('itemSearchGrid')) {
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
    } else if (itemSearchGrid) {
        // 이미 존재하는 경우 데이터만 초기화
        itemSearchGrid.resetData([]);
    }
}

/**
 * 창고 검색 모달 관련 함수
 */
function setupWarehouseSearchModal() {
    // 이미 그리드가 초기화되어 있는 경우 재사용
    if (!warehouseSearchGrid && document.getElementById('warehouseSearchGrid')) {
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
    } else if (warehouseSearchGrid) {
        // 이미 존재하는 경우 데이터만 초기화
        warehouseSearchGrid.resetData([]);
    }
}

/**
 * 모달 숨겨진 후 이벤트 처리 추가
 */
function setupModalEvents() {
    const itemSearchModal = document.getElementById('itemSearchModal');
    if (itemSearchModal) {
        itemSearchModal.addEventListener('hidden.bs.modal', function() {
            // 모달 닫힌 후 포커스 다시 설정
            setTimeout(() => {
                const itemNameElement = document.getElementById('itemName');
                if (itemNameElement) itemNameElement.focus();
            }, 100);
        });
    }

    const warehouseSearchModal = document.getElementById('warehouseSearchModal');
    if (warehouseSearchModal) {
        warehouseSearchModal.addEventListener('hidden.bs.modal', function() {
            // 모달 닫힌 후 포커스 다시 설정
            setTimeout(() => {
                const warehouseNameElement = document.getElementById('warehouseName');
                if (warehouseNameElement) warehouseNameElement.focus();
            }, 100);
        });
    }
}

// =============== 이벤트 핸들러 ===============
/**
 * 품목 그리드 클릭 이벤트 핸들러
 */
function handleItemGridClick(ev) {
    if (ev.rowKey === undefined) return;
    
    const rowData = itemSearchGrid.getRow(ev.rowKey);
    
    const itemCodeElement = document.getElementById('itemCode');
    const itemNameElement = document.getElementById('itemName');
    
    if (itemCodeElement && itemNameElement) {
        itemCodeElement.value = parseInt(rowData.item_code);
        itemNameElement.value = rowData.item_name;
        selectedItemType = rowData.item_type;
    }

    // 모달 닫기 전에 약간의 지연 추가
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('itemSearchModal'));
        if (modal) modal.hide();
    }, 50);
}

/**
 * 창고 그리드 클릭 이벤트 핸들러
 */
function handleWarehouseGridClick(ev) {
    if (ev.rowKey === undefined) return;
    
    const rowData = warehouseSearchGrid.getRow(ev.rowKey);
    
    const warehouseCodeElement = document.getElementById('warehouseCode');
    const warehouseNameElement = document.getElementById('warehouseName');
    
    if (warehouseCodeElement && warehouseNameElement) {
        warehouseCodeElement.value = rowData.warehouse_id;
        warehouseNameElement.value = rowData.warehouse_name;
        
        // 구역 로드
        loadZones(rowData.warehouse_id);
    }
    
    // 모달 닫기 전에 약간의 지연 추가
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseSearchModal'));
        if (modal) modal.hide();
    }, 50);
}

/**
 * 출처 선택 이벤트 바인딩
 */
function bindSourceSelectEvents() {
    const sourceOptions = document.querySelectorAll('.source-option');
    const sourceInput = document.getElementById('source');
    
    if (!sourceInput || sourceOptions.length === 0) return;
    
    sourceOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            // URL 파라미터로 수정 모드인지 확인
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            
            // 수정 모드가 아니고 수동입고가 아닌 옵션을 클릭한 경우 무시
            if (!mode && option.getAttribute('data-source') !== 'MANUAL') {
                event.preventDefault();
                return;
            }
            
            // 활성 옵션 갱신
            sourceOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            // hidden input 값 설정
            const sourceValue = option.getAttribute('data-source');
            sourceInput.value = sourceValue;
        });
    });
}

/**
 * 이벤트 리스너 설정
 */
function attachEventListeners() {
    // 품목 검색 모달 이벤트
    const itemSearchBtn = document.getElementById('itemSearchBtn');
    if (itemSearchBtn) {
        itemSearchBtn.addEventListener('click', function() {
            setupItemSearchModal(); // 모달 열기 전 그리드 준비
            
            const itemSearchModal = document.getElementById('itemSearchModal');
            if (!itemSearchModal) return;
            
            const modal = new bootstrap.Modal(itemSearchModal);
            modal.show();
            
            // 모달이 완전히 보여진 후 그리드 새로고침 및 데이터 로드
            itemSearchModal.addEventListener('shown.bs.modal', function() {
                if (itemSearchGrid) {
                    itemSearchGrid.refreshLayout();
                    searchItems();
                }
            }, { once: true });
        });
    }

    // 창고 검색 모달 이벤트
    const warehouseSearchBtn = document.getElementById('warehouseSearchBtn');
    if (warehouseSearchBtn) {
        warehouseSearchBtn.addEventListener('click', function() {
            const itemCodeElement = document.getElementById('itemCode');
            if (!itemCodeElement || !itemCodeElement.value) {
                Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
                return;
            }
            
            setupWarehouseSearchModal(); // 모달 열기 전 그리드 준비
            
            const warehouseSearchModal = document.getElementById('warehouseSearchModal');
            if (!warehouseSearchModal) return;
            
            const modal = new bootstrap.Modal(warehouseSearchModal);
            modal.show();
            
            // 모달이 완전히 보여진 후 그리드 새로고침 및 데이터 로드
            warehouseSearchModal.addEventListener('shown.bs.modal', function() {
                if (warehouseSearchGrid) {
                    warehouseSearchGrid.refreshLayout();
                    searchWarehouses();
                }
            }, { once: true });
        });
    }

    // 검색 입력창 엔터 키 이벤트
    const itemSearchInput = document.getElementById('itemSearchInput');
    if (itemSearchInput) {
        itemSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchItems();
            }
        });
    }

    const warehouseSearchInput = document.getElementById('warehouseSearchInput');
    if (warehouseSearchInput) {
        warehouseSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchWarehouses();
            }
        });
    }

    // 저장 버튼 이벤트 - HTML onclick 속성 대신 이벤트 리스너만 사용
    const saveBtn = document.getElementById('saveInboundBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveInbound);
    }
}

// =============== 데이터 처리 함수 ===============
/**
 * URL 파라미터 확인 및 수정 모드 처리
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const inNo = urlParams.get('inNo');
    const mode = urlParams.get('mode');
    
    if (inNo) {
        // 수정 모드 - 기존 데이터 로드
        loadInboundData(inNo);
    } else {
        // 새 등록 모드 - 수동입고로 고정
        setManualSource();
    }
}

/**
 * 새 등록 시 출처를 수동입고로 고정
 */
function setManualSource() {
    const sourceOptions = document.querySelectorAll('.source-option');
    const sourceInput = document.getElementById('source');
    
    if (!sourceInput || sourceOptions.length === 0) return;
    
    // 모든 옵션 비활성화
    sourceOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    // 수동입고 옵션 활성화 및 선택
    const manualOption = document.querySelector('.source-option[data-source="MANUAL"]');
    if (manualOption) {
        manualOption.classList.add('active');
        sourceInput.value = 'MANUAL';
    }
    
    // 수정 모드가 아닐 경우 옵션들을 비활성화
    sourceOptions.forEach(option => {
        if (option.getAttribute('data-source') !== 'MANUAL') {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.5';
        }
    });
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
        })
        .catch(error => {
            console.error('입고 데이터 로드 실패:', error);
            Swal.fire('오류', '입고 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        });
}

/**
 * 폼 데이터 채우기
 */
function fillFormData(data) {
    const elements = {
        inNo: document.getElementById('inNo'),
        inDate: document.getElementById('inDate'),
        itemCode: document.getElementById('itemCode'),
        itemName: document.getElementById('itemName'),
        inQty: document.getElementById('inQty'),
        warehouseCode: document.getElementById('warehouseCode'),
        warehouseName: document.getElementById('warehouseName'),
        source: document.getElementById('source')
    };
    
    // 요소가 존재하는지 확인 후 값 설정
    if (elements.inNo) elements.inNo.value = data.in_no;
    if (elements.inDate) elements.inDate.value = data.in_date;
    if (elements.itemCode) elements.itemCode.value = data.item_no;
    if (elements.itemName) elements.itemName.value = data.item_name;
    if (elements.inQty) elements.inQty.value = data.in_qty;
    if (elements.warehouseCode) elements.warehouseCode.value = data.warehouse_id;
    if (elements.warehouseName) elements.warehouseName.value = data.warehouse_name;
    if (elements.source) elements.source.value = data.source || '';
    
    // 출처 옵션 활성화
    const sourceOptions = document.querySelectorAll('.source-option');
    sourceOptions.forEach(option => {
        option.classList.remove('active');
        option.style.pointerEvents = 'auto';
        option.style.opacity = '1';
        if (option.getAttribute('data-source') === data.source) {
            option.classList.add('active');
        }
    });
    
    // 품목 타입 설정 추가
    console.log('받은 데이터:', data);
    console.log('품목 타입:', data.item_type);
    if (data.item_type) {
        selectedItemType = data.item_type;
        console.log('설정된 selectedItemType:', selectedItemType);
    }
    
    // 1. 품목 선택 확인
    // 2. 품목 타입 설정 
    // 3. 그 다음 창고/구역 정보 로드
    
    if (data.warehouse_id && data.item_no) {
        // 약간의 지연 후 구역 로드 (품목 정보가 완전히 설정된 후)
        setTimeout(() => {
            loadZones(data.warehouse_id).then(() => {
                const zoneSelect = document.getElementById('zone');
                if (zoneSelect) {
                    zoneSelect.value = data.zone;
                }
            });
        }, 500);
    }
}
    
/**
 * 품목 검색
 */
function searchItems() {
    const itemSearchInputElement = document.getElementById('itemSearchInput');
    if (!itemSearchInputElement) return;
    
    const keyword = itemSearchInputElement.value;
    const headers = createHeaders();
    
    fetch(`/api/inbound/search/items?keyword=${encodeURIComponent(keyword)}`, {
        headers: headers
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (!itemSearchGrid) {
            console.error('품목 검색 그리드가 초기화되지 않았습니다.');
            return;
        }
        
        const transformedData = data.map(item => ({
            item_code: item.item_code || item.ITEM_CODE,
            item_name: item.item_name || item.ITEM_NAME,
            item_type: item.item_type || item.ITEM_TYPE
        }));
        itemSearchGrid.resetData(transformedData);
    })
    .catch(error => {
        console.error('품목 검색 실패:', error);
        Swal.fire('오류', '품목 검색 중 오류가 발생했습니다.', 'error');
    });
}

/**
 * 창고 검색
 */
function searchWarehouses() {
    const warehouseSearchInputElement = document.getElementById('warehouseSearchInput');
    const itemCodeElement = document.getElementById('itemCode');
    
    if (!warehouseSearchInputElement || !itemCodeElement) return;
    
    const keyword = warehouseSearchInputElement.value;
    const itemCode = itemCodeElement.value;
    
    if (!itemCode) {
        Swal.fire('확인', '먼저 품목을 선택해주세요.', 'warning');
        return;
    }

    const headers = createHeaders();
    
    // URL 구성 시 itemType 파라미터 추가
    let url = `/api/inbound/search/warehouses?keyword=${encodeURIComponent(keyword)}&itemNo=${itemCode}`;
    
    // itemType 파라미터 추가
    if (selectedItemType) {
        url += `&itemType=${encodeURIComponent(selectedItemType === '완제품' ? '완제품' : '자재')}`;
    } else {
        // 기본값 설정 - 서버에서 필수 파라미터이므로 기본값 제공
        url += `&itemType=자재`;
    }
    
    console.log('요청 URL:', url);
    console.log('선택된 아이템 타입:', selectedItemType);
    
    fetch(url, { headers: headers })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('에러 응답:', text);
                    throw new Error(`요청 실패 (${response.status}): ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (!warehouseSearchGrid) {
                console.error('창고 검색 그리드가 초기화되지 않았습니다.');
                return;
            }
            
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
            console.error('창고 검색 실패:', error);
            Swal.fire('오류', '창고 검색 중 오류가 발생했습니다.', 'error');
        });
}

/**
 * 구역 정보 로드
 */
async function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    if (!zoneSelect) return Promise.resolve();
    
    zoneSelect.disabled = true;

    const itemCodeElement = document.getElementById('itemCode');
    const itemCode = itemCodeElement ? itemCodeElement.value : null;
    
    if (!itemCode || !warehouseCode) {
        zoneSelect.innerHTML = '<option value="">구역 선택</option>';
        zoneSelect.disabled = true;
        return Promise.resolve();
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
            // 경고 표시를 제거하고 기본 옵션만 표시
            zoneSelect.innerHTML = '<option value="">구역 선택</option>';
            
            // 또는 기본 구역 옵션 제공 (예: '기본구역')
            zoneSelect.innerHTML = '<option value="기본구역">기본구역</option>';
            zoneSelect.value = '기본구역';
            
            // 경고 메시지 대신 간단한 콘솔 로그만 남김
            console.log('해당 창고에 선택 가능한 구역이 없어 기본 구역으로 설정합니다.');
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
        return Promise.resolve();
    }
}

/**
 * 입고 데이터 저장
 */
function saveInbound() {
    if (!validateForm()) return;

    const elements = {
        inNo: document.getElementById('inNo'),
        itemCode: document.getElementById('itemCode'),
        inDate: document.getElementById('inDate'),
        inQty: document.getElementById('inQty'),
        warehouseCode: document.getElementById('warehouseCode'),
        zone: document.getElementById('zone'),
        source: document.getElementById('source')
    };
    
    // 모든 필수 요소가 존재하는지 확인
    const requiredElements = ['itemCode', 'inDate', 'inQty', 'warehouseCode', 'zone', 'source'];
    for (const el of requiredElements) {
        if (!elements[el]) {
            Swal.fire('오류', `필수 입력 요소(${el})를 찾을 수 없습니다.`, 'error');
            return;
        }
    }

    const inboundData = {
        in_no: elements.inNo && elements.inNo.value ? parseInt(elements.inNo.value) : null,
        item_no: parseInt(elements.itemCode.value),
        in_date: elements.inDate.value,
        in_qty: parseInt(elements.inQty.value),
        warehouse_id: elements.warehouseCode.value,
        zone: elements.zone.value,
        status: "대기",
        source: elements.source.value
    };

    const headers = createHeaders();
    const inNo = elements.inNo ? elements.inNo.value : null;
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
        
        // 서버에서 반환된 상세 에러 메시지 처리
        const errorMessage = error.message || 
            (typeof error === 'object' ? JSON.stringify(error) : '데이터 저장 중 오류가 발생했습니다.');
        
        Swal.fire({
            title: '오류',
            text: errorMessage,
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
        const element = document.getElementById(id);
        const value = element ? element.value : null;
        
        if (!value) {
            Swal.fire('확인', message, 'warning');
            
            // 해당 요소가 존재하면 포커스 설정
            if (element) {
                element.focus();
            }
            
            return false;
        }
    }
    
    // 입고수량 추가 검증
    const inQtyElement = document.getElementById('inQty');
    if (inQtyElement) {
        const inQty = parseInt(inQtyElement.value);
        if (isNaN(inQty) || inQty <= 0) {
            Swal.fire('확인', '유효한 입고수량을 입력하세요.', 'warning');
            inQtyElement.focus();
            return false;
        }
    }
    
    return true;
}

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

/**
* 에러 처리 유틸리티
* @param {Error} error - 발생한 오류
* @param {string} customMessage - 사용자에게 표시할 메시지
*/
function handleError(error, customMessage) {
   console.error('오류:', error);
   Swal.fire({
       title: '오류',
       text: customMessage,
       icon: 'error'
   });
}