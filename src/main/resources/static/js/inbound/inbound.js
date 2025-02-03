$(function() {    
    // 데이트피커 초기화
    const datePickerOptions = {
        language: 'ko',
        date: new Date(),
        type: 'date',
        input: {
            format: 'yyyy-MM-dd'
        },
        showAlways: false,
        autoClose: true
    };
    
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

    const startDatePicker = new tui.DatePicker('#startDatePicker', {
        ...datePickerOptions,
        input: {
            element: '#startDate',
            format: 'yyyy-MM-dd'
        }
    });

    const endDatePicker = new tui.DatePicker('#endDatePicker', {
        ...datePickerOptions,
        input: {
            element: '#endDate',
            format: 'yyyy-MM-dd'
        }
    });

    // 그리드 컬럼 정의
    const gridColumns = [
        {header: '입고번호', name: 'in_no'},
        {header: '품목명', name: 'item_name'},
        {header: '입고수량', name: 'in_qty'},
        {header: '창고명', name: 'warehouse_name'},
        {header: '구역', name: 'zone'},
        {header: '검수자', name: 'inspector'},
        {header: '검수결과', name: 'inspection_result'},
        {header: '등록자', name: 'reg_user'},
        {header: '등록일', name: 'reg_date'},
        {header: '입고일자', name: 'in_date'},
        {header: '상태', name: 'status'},
    ];

    // 그리드 초기화
    let pendingGrid = null;
    let completeGrid = null;

    function initializeGrids() {
        // 대기 그리드 초기화
        pendingGrid = new tui.Grid({
            el: document.getElementById('pendingGrid'),
            columns: gridColumns,
            data: [],
            minBodyHeight: 400  // 최소 높이 설정
        });

        // 완료 그리드 초기화
        completeGrid = new tui.Grid({
            el: document.getElementById('completeGrid'),
            columns: gridColumns,
            data: [],
            minBodyHeight: 400  // 최소 높이 설정
        });

        // 초기 탭에 대한 그리드 레이아웃 새로고침
        pendingGrid.refreshLayout();
    }

    // 검색 기능
    function search() {
        const searchInput = document.getElementById('searchInput').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const activeTab = document.querySelector('.nav-link.active').id;

        // TODO: 실제 검색 API 호출 및 데이터 처리
        console.log('Search parameters:', { searchInput, startDate, endDate, activeTab });
    }

    // 탭 변경 이벤트 처리
    function initializeTabEvents() {
        document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', function (event) {
                // 탭 전환 시 해당하는 그리드 새로고침
                if (event.target.id === 'pending-tab') {
                    pendingGrid.refreshLayout();
                } else if (event.target.id === 'complete-tab') {
                    // setTimeout을 사용하여 DOM 업데이트 후 레이아웃 새로고침
                    setTimeout(() => {
                        completeGrid.refreshLayout();
                    }, 0);
                }
            });
        });
    }

    // 입고등록 버튼 이벤트
    function openInboundRegistration() {
        console.log('Opening inbound registration popup');
        var popupW = 700;
        var popupH = 600;
        var left = (document.body.clientWidth / 2) - (popupW / 2);
        left += window.screenLeft;  // 듀얼 모니터 대응
        var top = (screen.availHeight / 2) - (popupH / 2);
        
        window.open('/inboundPopup', '', 
            'width=' + popupW + ',height=' + popupH + 
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    // 페이지 로드 시 초기화
    initializeGrids();
    initializeTabEvents();
    
    // 검색 버튼 이벤트 리스너
    document.querySelector('.search-container .btn-primary').addEventListener('click', search);
    
    // 입고등록 버튼 이벤트 리스너
    $('.buttons .btn-primary').on('click', openInboundRegistration);

    // 윈도우 리사이즈 이벤트에 대한 그리드 새로고침
    window.addEventListener('resize', () => {
        pendingGrid.refreshLayout();
        completeGrid.refreshLayout();
    });
});