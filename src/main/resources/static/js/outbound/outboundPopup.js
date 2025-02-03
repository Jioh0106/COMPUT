document.addEventListener('DOMContentLoaded', function() {
    // CSRF 토큰 관련 처리
    const csrfMeta = document.querySelector('meta[name="_csrf"]');
    const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
            
    let token = null;
    let header = null;
        
    if (csrfMeta && csrfHeaderMeta) {
        token = csrfMeta.content;
        header = csrfHeaderMeta.content;
    }

    initOutboundForm();
    initializeGrids();
    attachEventListeners();

    // saveOutbound 함수에서 사용할 수 있도록 전역 변수로 설정
    window.csrfToken = token;
    window.csrfHeader = header;
});
    
// 출고 폼 초기화
function initOutboundForm() {
    // 출고번호 자동생성 해야됨
    
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
    
    // 출고일자 데이트피커 초기화
    const outDatePicker = new tui.DatePicker('#outDatePicker', {
        language: 'ko',
        date: new Date(),
        type: 'date',
        input: {
            element: '#outDate',
            format: 'yyyy-MM-dd'
        },
        showAlways: false,
        autoClose: true
    });
}

// 그리드 초기화
function initializeGrids() {
    // 품목 검색 그리드
    const itemSearchGrid = new tui.Grid({
        el: document.getElementById('itemSearchGrid'),
        columns: [
            {header: '품목코드', name: 'item_code'},
            {header: '품목명', name: 'item_name'},
            {header: '재고수량', name: 'stock_qty'},
            {header: '품목구분', name: 'item_type'}
        ],
        data: []
    });

    // 창고 검색 그리드
    const warehouseSearchGrid = new tui.Grid({
        el: document.getElementById('warehouseSearchGrid'),
        columns: [
            {header: '창고코드', name: 'warehouse_code'},
            {header: '창고명', name: 'warehouse_name'},
        ],
        data: []
    });

    // 품목 선택 이벤트
    itemSearchGrid.on('click', function(ev) {
        if (ev.rowKey === undefined) return;
        const rowData = itemSearchGrid.getRow(ev.rowKey);
        document.getElementById('itemCode').value = rowData.item_code;
        document.getElementById('itemName').value = rowData.item_name;
        document.getElementById('stockQty').value = rowData.stock_qty;
        const modal = bootstrap.Modal.getInstance(document.getElementById('itemSearchModal'));
        if (modal) modal.hide();
    });

    // 창고 선택 이벤트
    warehouseSearchGrid.on('click', function(ev) {
        if (ev.rowKey === undefined) return;
        const rowData = warehouseSearchGrid.getRow(ev.rowKey);
        document.getElementById('warehouseCode').value = rowData.warehouse_code;
        document.getElementById('warehouseName').value = rowData.warehouse_name;
        document.getElementById('availableStock').value = rowData.available_stock;
        
        loadZones(rowData.warehouse_code);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseSearchModal'));
        if (modal) modal.hide();
    });
}

// 이벤트 리스너 설정
function attachEventListeners() {
    // 품목 검색 버튼
    document.getElementById('itemSearchBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('itemSearchModal'));
        modal.show();
        searchItems();
    });

    // 창고 검색 버튼
    document.getElementById('warehouseSearchBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('warehouseSearchModal'));
        modal.show();
        searchWarehouses();
    });

    // 출고수량 변경 시 재고 체크
    document.getElementById('outQty').addEventListener('change', function(e) {
        const qty = parseInt(e.target.value) || 0;
        const stockQty = parseInt(document.getElementById('stockQty').value) || 0;
        
        if (qty > stockQty) {
            Swal.fire('경고', '재고수량을 초과할 수 없습니다.', 'warning');
            e.target.value = stockQty;
        }
    });
}


// 저장 기능
function saveOutbound() {
    // 입력값 검증
    if (!validateForm()) return;

    const outboundData = {
        outNo: document.getElementById('outNo').value,
        itemCode: document.getElementById('itemCode').value,
        itemName: document.getElementById('itemName').value,
        outQty: document.getElementById('outQty').value,
        outDate: document.getElementById('outDate').value,
        warehouseCode: document.getElementById('warehouseCode').value,
        warehouseName: document.getElementById('warehouseName').value,
        zone: document.getElementById('zone').value,
        regUser: document.getElementById('regUser').value,
        status: document.getElementById('status').value,
    };

    fetch('/api/outbound/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        },
        body: JSON.stringify(outboundData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: "저장 완료",
                text: "출고 등록이 완료되었습니다.",
                icon: "success"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.opener.location.reload();
                    window.close();
                }
            });
        }
    });
}

// 폼 검증
function validateForm() {
    const required = {
        'itemName': '품목을 선택하세요.',
        'outQty': '출고수량을 입력하세요.',
        'warehouseName': '창고를 선택하세요.',
        'zone': '구역을 선택하세요.',
        'regUser': '등록자를 입력하세요.'
    };

    for (let [id, message] of Object.entries(required)) {
        const value = document.getElementById(id).value;
        if (!value) {
            Swal.fire('확인', message, 'warning');
            return false;
        }
    }
    
    // 재고 수량 체크
    const outQty = parseInt(document.getElementById('outQty').value) || 0;
    const stockQty = parseInt(document.getElementById('stockQty').value) || 0;
    
    if (outQty > stockQty) {
        Swal.fire('확인', '재고수량을 초과할 수 없습니다.', 'warning');
        return false;
    }
    
    return true;
}

// API 호출 함수들
function searchItems() {
    const keyword = document.getElementById('itemSearchInput').value;
    // TODO: API 호출
}

function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    // TODO: API 호출
}

function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = false;
    
    // TODO: API 호출
    const sampleZones = ['A구역', 'B구역', 'C구역'];
    zoneSelect.innerHTML = '<option value="">구역 선택</option>' + 
        sampleZones.map(zone => `<option value="${zone}">${zone}</option>`).join('');
}