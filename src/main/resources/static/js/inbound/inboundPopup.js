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

    initInboundForm();
    initializeGrids();
    attachEventListeners();

	// saveInbound 함수에서 사용할 수 있도록 전역 변수로 설정
	window.csrfToken = token;
	window.csrfHeader = header;
	});
	
	// 입고 폼 초기화
	function initInboundForm() {
	    // 입고번호 자동생성 해야됨
	    
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
	    
	    // 입고일자 데이트피커 초기화
	    const inDatePicker = new tui.DatePicker('#inDatePicker', {
	        language: 'ko',
	        date: new Date(),
	        type: 'date',
	        input: {
	            element: '#inDate',
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
            {header: '품목구분', name: 'item_type'}
        ],
        data: []
    });

    // 창고 검색 그리드
    const warehouseSearchGrid = new tui.Grid({
        el: document.getElementById('warehouseSearchGrid'),
        columns: [
            {header: '창고코드', name: 'warehouse_code'},
            {header: '창고명', name: 'warehouse_name'}
        ],
        data: []
    });

    // 품목 선택 이벤트
    itemSearchGrid.on('click', function(ev) {
        if (ev.rowKey === undefined) return;
        const rowData = itemSearchGrid.getRow(ev.rowKey);
        document.getElementById('itemCode').value = rowData.item_code;
        document.getElementById('itemName').value = rowData.item_name;
        const modal = bootstrap.Modal.getInstance(document.getElementById('itemSearchModal'));
        if (modal) modal.hide();
    });

    // 창고 선택 이벤트
    warehouseSearchGrid.on('click', function(ev) {
        if (ev.rowKey === undefined) return;
        const rowData = warehouseSearchGrid.getRow(ev.rowKey);
        document.getElementById('warehouseCode').value = rowData.warehouse_code;
        document.getElementById('warehouseName').value = rowData.warehouse_name;
        
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
        
        // TODO: API 호출
        searchItems();
    });

    // 창고 검색 버튼
    document.getElementById('warehouseSearchBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('warehouseSearchModal'));
        modal.show();
        
        // TODO: API 호출
        searchWarehouses();
    });

    // 입고수량 변경 시 검수결과 자동 설정
    document.getElementById('inQty').addEventListener('change', function(e) {
        const qty = parseInt(e.target.value) || 0;
        document.getElementById('normalQty').value = qty;
        document.getElementById('defectQty').value = 0;
    });
}


// 저장 기능
function saveInbound() {
    // 입력값 검증
    if (!validateForm()) return;

    const inboundData = {
        inNo: document.getElementById('inNo').value,
        itemCode: document.getElementById('itemCode').value,
        itemName: document.getElementById('itemName').value,
        inQty: document.getElementById('inQty').value,
        inDate: document.getElementById('inDate').value,
        warehouseCode: document.getElementById('warehouseCode').value,
        warehouseName: document.getElementById('warehouseName').value,
        zone: document.getElementById('zone').value,
        inspector: document.getElementById('inspector').value,
        normalQty: document.getElementById('normalQty').value,
        defectQty: document.getElementById('defectQty').value,
        regUser: document.getElementById('regUser').value,
        status: document.getElementById('status').value
    };

    //저장
    fetch('/api/inbound/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        },
        body: JSON.stringify(inboundData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: "저장 완료",
                text: "입고 등록이 완료되었습니다.",
                icon: "success"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.opener.location.reload(); // 부모 창 새로고침
                    window.close(); // 팝업 창 닫기
                }
            });
        }
    });
}

// 폼 검증
function validateForm() {
    const required = {
        'itemName': '품목을 선택하세요.',
        'inQty': '입고수량을 입력하세요.',
        'warehouseName': '창고를 선택하세요.',
        'zone': '구역을 선택하세요.',
        'inspector': '검수자를 입력하세요.',
        'normalQty': '정상수량을 입력하세요.',
        'defectQty': '불량수량을 입력하세요.'
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

// API 호출 함수들
function searchItems() {
    const keyword = document.getElementById('itemSearchInput').value;
    //품목 검색 API
}

function searchWarehouses() {
    const keyword = document.getElementById('warehouseSearchInput').value;
    //창고 검색 API
}

function loadZones(warehouseCode) {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.disabled = false;
    
    //구역 검색
    const sampleZones = ['A구역', 'B구역', 'C구역'];
    zoneSelect.innerHTML = '<option value="">구역 선택</option>' + 
        sampleZones.map(zone => `<option value="${zone}">${zone}</option>`).join('');
}