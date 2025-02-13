// 전역 변수 선언
let itemSearchGrid = null;
let warehouseSearchGrid = null;
let inDatePicker = null;
let selectedItemType = ''; 

// DOMContentLoaded 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    // CSRF 토큰 초기화
    initializeCsrf();
    // 폼 초기화
    initInboundForm();
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
    const inNo = urlParams.get('inNo');
    
    if (inNo) {
        loadInboundData(inNo);
    }
}

// 입고 데이터 로드 (수정 모드)
function loadInboundData(inNo) {
    fetch(`/api/inbound/${inNo}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                fillFormData(result.data);
            }
        })
}

// 폼 데이터 채우기
function fillFormData(data) {
    document.getElementById('inNo').value = data.in_no;
    document.getElementById('inDate').value = data.in_date;
    document.getElementById('itemCode').value = data.inventory_no;
    document.getElementById('itemName').value = data.item_name;
    document.getElementById('inQty').value = data.in_qty;
    document.getElementById('warehouseCode').value = data.warehouse_id;
    document.getElementById('warehouseName').value = data.warehouse_name;
    
    // 구역 정보 로드 및 선택
    loadZones(data.warehouse_id).then(() => {
        const zoneSelect = document.getElementById('zone');
        // zoneSelect의 options가 모두 로드된 후에 값을 설정
        setTimeout(() => {
            zoneSelect.value = data.zone;
        }, 100);
    });
}

// 폼 초기화
function initInboundForm() {
    // 데이트피커 스타일 추가
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
            createColumn({header: '품목명', name: 'item_name',width:200}),
            createColumn({header: '품목구분', name: 'item_type'}),
        ],
        data: [],
        bodyHeight: 250
    });

    // 품목 그리드 클릭 이벤트
    itemSearchGrid.on('click', function(ev) {
        if (ev.rowKey === undefined) return;
        const rowData = itemSearchGrid.getRow(ev.rowKey);
        document.getElementById('itemCode').value = rowData.item_code;
        document.getElementById('itemName').value = rowData.item_name;
		selectedItemType = rowData.item_type; 
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
        
        loadZones(rowData.warehouse_id);
        
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

    // 품목 검색 입력창 엔터 키
    document.getElementById('itemSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchItems();
        }
    });

    // 창고 검색 입력창 엔터 키
    document.getElementById('warehouseSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchWarehouses();
        }
    });
}

// 품목 검색
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
    })
}

// 창고 검색
function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    
    const headers = {
        'Content-Type': 'application/json'
    };

    if (window.csrfHeader && window.csrfToken) {
        headers[window.csrfHeader] = window.csrfToken;
    }
    
    fetch(`/api/inbound/search/warehouses?keyword=${encodeURIComponent(keyword)}`, {
        headers: headers
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        const dataArray = Array.isArray(data) ? data : [data];
        
		
		// 품목 타입에 따른 창고 필터링
	    const filteredData = dataArray.filter(warehouse => {
	         const warehouseType = (warehouse.warehouse_type || warehouse.WAREHOUSE_TYPE || '').toLowerCase();
	         
	         if (selectedItemType === '자재') {
	             return warehouseType.includes('자재') || warehouseType === '자재창고';
	         } else if (selectedItemType === '완제품') {
	             return warehouseType.includes('제품') || warehouseType === '제품창고';
	         }
	         
	         return true; // 품목이 선택되지 않은 경우 모든 창고 표시
	    });
			 
        const transformedData = filteredData.map(warehouse => ({
            warehouse_id: warehouse.warehouse_id || warehouse.WAREHOUSE_ID,
            warehouse_name: warehouse.warehouse_name || warehouse.WAREHOUSE_NAME,
            warehouse_type: warehouse.warehouse_type || warehouse.WAREHOUSE_TYPE,
            zone: warehouse.zone || warehouse.ZONE
        }));
        
        warehouseSearchGrid.resetData(transformedData);
    })
}

// 구역 로드
async function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = true;

        const response = await fetch(`/api/inbound/warehouse/${warehouseCode}/zones`);
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

// 입고 저장
function saveInbound() {
    if (!validateForm()) return;

    const inNo = document.getElementById('inNo').value;
    const inboundData = {
        in_no: inNo ? parseInt(inNo) : null,
        inventory_no: parseInt(document.getElementById('itemCode').value),
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
            if (window.opener && !window.opener.closed) {
                window.opener.location.reload();
            }
            
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
}
     

// 폼 유효성 검사
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