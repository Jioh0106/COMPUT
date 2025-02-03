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
        {header: '출고번호', name: 'out_no'},
        {header: '품목명', name: 'item_name'},
        {header: '출고수량', name: 'out_qty'},
        {header: '출고일자', name: 'out_date'},
        {header: '창고명', name: 'warehouse_name'},
        {header: '구역', name: 'zone'},
        {header: '등록자', name: 'reg_user'},
        {header: '등록일', name: 'reg_date'},
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
            minBodyHeight: 400
        });

        // 완료 그리드 초기화
        completeGrid = new tui.Grid({
            el: document.getElementById('completeGrid'),
            columns: gridColumns,
            data: [],
            minBodyHeight: 400
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

    // 출고등록 버튼 이벤트
    function openOutboundRegistration() {
        console.log('Opening outbound registration popup');
        var popupW = 800;  
        var popupH = 600;
        var left = (document.body.clientWidth / 2) - (popupW / 2);
        left += window.screenLeft;  // 듀얼 모니터 대응
        var top = (screen.availHeight / 2) - (popupH / 2);
        
        window.open('/outboundPopup', '', 
            'width=' + popupW + ',height=' + popupH + 
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    // 출고완료 처리 함수
    function completeOutbound(outNo) {
        Swal.fire({
            title: '출고완료 처리',
            text: '선택한 출고를 완료 처리하시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: API 호출하여 출고완료 처리
                fetch('/api/outbound/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                    body: JSON.stringify({ outNo: outNo })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('완료', '출고완료 처리되었습니다.', 'success')
                        .then(() => {
                            search(); // 목록 새로고침
                        });
                    }
                });
            }
        });
    }

    // 페이지 로드 시 초기화
    initializeGrids();
    initializeTabEvents();
    
    // 검색 버튼 이벤트 리스너
    document.querySelector('.search-container .btn-primary').addEventListener('click', search);
    
    // 출고등록 버튼 이벤트 리스너
    $('.buttons .btn-primary').on('click', openOutboundRegistration);

    // 윈도우 리사이즈 이벤트에 대한 그리드 새로고침
    window.addEventListener('resize', () => {
        pendingGrid.refreshLayout();
        completeGrid.refreshLayout();
    });

    // 초기 검색 실행
    search();
});