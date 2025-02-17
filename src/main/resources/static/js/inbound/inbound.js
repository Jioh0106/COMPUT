/**
 * 입고 관리 모듈
 */
$(function() {    
    // =============== 전역 변수 정의 ===============
    let pendingGrid = null;    // 대기 상태 그리드
    let completeGrid = null;   // 완료 상태 그리드

    // =============== 상수 정의 ===============
    // 날짜 관련 상수
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // 데이트피커 기본 옵션
    const datePickerOptions = {
        language: 'ko',
        date: new Date(),
        type: 'date',
        input: {
            format: 'yyyy-MM-dd'
        },
        showAlways: false,
        autoClose: true,
        selectableRanges: [
            [new Date(1900, 0, 1), new Date()]
        ]
    };

    // =============== 컴포넌트 클래스 정의 ===============
    /**
     * 상태 버튼 렌더러 클래스
     * 그리드 내 상태 표시 및 상태 변경 버튼을 렌더링
     */
    class StatusButtonRenderer {
        constructor(props) {
            this.el = document.createElement('button');
            this.render(props);
        }

        getElement() {
            return this.el;
        }

        render(props) {
            const el = this.el;
            const grid = props.grid;
            
            if (props.value === '대기') {
                el.className = 'btn btn-sm btn-warning';
                el.innerHTML = '입고대기';
                el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rowKey = props.rowKey;
                    const rowData = grid.getRow(rowKey);
                    changeStatus(rowData.in_no);
                };
            } else {
                el.className = 'btn btn-sm btn-success';
                el.innerHTML = '입고완료';
                el.disabled = true;
            }
        }
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
     * 기본 컬럼 정의 반환
     */
    function getBaseColumns() {
        return [
            createColumn({header: '입고번호', name: 'in_no'}),
            createColumn({header: '품목코드', name: 'item_code'}),
            createColumn({header: '품목명', name: 'item_name', width: 200}),
            createColumn({
                header: '품목구분', 
                name: 'item_type',
                formatter: (value) => value.value === 'RAW' ? '자재' :
                    value.value === 'PRODUCT' ? '완제품' :
                    value.value
            }),
            createColumn({header: '단위', name: 'item_unit'}),
            createColumn({header: '입고수량', name: 'in_qty'}),
            createColumn({header: '입고일자', name: 'in_date'}),
            createColumn({header: '창고명', name: 'warehouse_name'}),
            createColumn({header: '구역', name: 'zone'}),
            createColumn({
                header: '상태', 
                name: 'status', 
                renderer: {type: StatusButtonRenderer}
            })
        ];
    }

    /**
     * 완료 탭용 확장 컬럼 정의 반환
     */
    function getCompleteColumns() {
        const baseColumns = getBaseColumns();
        return [
            ...baseColumns,
            createColumn({header: '승인자', name: 'reg_user'}),
            createColumn({header: '승인일', name: 'reg_date'})
        ];
    }

    // =============== 팝업 관련 함수 ===============
    /**
     * 입고등록 팝업 열기
     */
    function openInboundRegistration() {
        const popupW = 700;
        const popupH = 600;
        const left = (window.screen.width / 2) - (popupW / 2);
        const top = (window.screen.height / 2) - (popupH / 2);
        
        window.open('/inboundPopup?' + new Date().getTime(), 'inboundPopup', 
            'width=' + popupW + ',height=' + popupH + 
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    /**
     * 일반 팝업 열기
     */
    function openPopup(url) {
        const popupW = 700;
        const popupH = 600;
        const left = (window.screen.width / 2) - (popupW / 2);
        const top = (window.screen.height / 2) - (popupH / 2);
              
        window.open(url, 'inboundPopup',
            'width=' + popupW + ',height=' + popupH +
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    // =============== 초기화 함수 ===============
    /**
     * 데이트피커 초기화 및 이벤트 설정
     */
    function initializeDatePickers() {
        const startDatePicker = new tui.DatePicker('#startDatePicker', {
            ...datePickerOptions,
            date: firstDay,
            input: {
                element: '#startDate',
                format: 'yyyy-MM-dd'
            }
        });

        const endDatePicker = new tui.DatePicker('#endDatePicker', {
            ...datePickerOptions,
            date: today,
            input: {
                element: '#endDate',
                format: 'yyyy-MM-dd'
            }
        });
        
        // 시작일 변경 이벤트
        startDatePicker.on('change', () => {
            const startDate = startDatePicker.getDate();
            endDatePicker.setRanges([[startDate, new Date()]]);
            
            const endDate = endDatePicker.getDate();
            if (endDate < startDate) {
                endDatePicker.setDate(startDate);
            }
        });

        // 종료일 변경 이벤트
        endDatePicker.on('change', () => {
            const endDate = endDatePicker.getDate();
            startDatePicker.setRanges([[new Date(1900, 0, 1), endDate]]);
            
            const startDate = startDatePicker.getDate();
            if (startDate > endDate) {
                startDatePicker.setDate(endDate);
            }
        });
    }

    /**
     * 그리드 초기화 및 설정
     */
    function initializeGrids() {
        // 기존 그리드 정리
        if (pendingGrid) {
            pendingGrid.destroy();
            pendingGrid = null;
        }
        if (completeGrid) {
            completeGrid.destroy();
            completeGrid = null;
        }
        
        // 컨테이너 초기화
        const pendingContainer = document.getElementById('pendingGrid');
        const completeContainer = document.getElementById('completeGrid');
        
        if (!pendingContainer || !completeContainer) {
            console.error('그리드 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        pendingContainer.innerHTML = '';
        completeContainer.innerHTML = '';

        // 그리드 공통 옵션
        const gridOptions = {
            bodyHeight: 400,
            minBodyHeight: 400,
            scrollX: true,
            scrollY: true,
        };

        // 대기 그리드 생성
        pendingGrid = new tui.Grid({
            el: document.getElementById('pendingGrid'),
            columns: getBaseColumns(),
            data: [],
            rowHeaders: ['checkbox'],
            ...gridOptions
        });

        // 완료 그리드 생성
        completeGrid = new tui.Grid({
            el: document.getElementById('completeGrid'),
            columns: getCompleteColumns(),
            data: [],
            ...gridOptions
        });

        // 체크박스 이벤트 연결
        pendingGrid.on('check', updateButtonsState);
        pendingGrid.on('uncheck', updateButtonsState);
        pendingGrid.on('checkAll', updateButtonsState);
        pendingGrid.on('uncheckAll', updateButtonsState);
    }

    /**
     * 탭 이벤트 초기화
     */
    function initializeTabEvents() {
        // 기존 이벤트 제거
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            const bsTab = new bootstrap.Tab(tab);
            tab.removeEventListener('shown.bs.tab', null);
        });

        // 새 이벤트 설정
        const mainTab = document.getElementById('mainTab');
        if (mainTab) {
            mainTab.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', () => {
                    const pendingContainer = document.getElementById('pendingGrid');
                    const completeContainer = document.getElementById('completeGrid');
                    
                    if (pendingContainer) pendingContainer.innerHTML = '';
                    if (completeContainer) completeContainer.innerHTML = '';
                    
                    pendingGrid = null;
                    completeGrid = null;
                    
                    initializeGrids();
                    search();
                });
            });
        }
    }

    // =============== 상태 관리 함수 ===============
    /**
     * 버튼 상태 업데이트
     * 선택된 행에 따라 버튼들의 활성화/비활성화 상태를 조정
     */
    function updateButtonsState() {
        const checkedRows = pendingGrid.getCheckedRows();
        const modifyBtn = document.getElementById('modifyBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const completeBtn = document.getElementById('completeBtn');
        
        if (modifyBtn) {
            modifyBtn.disabled = checkedRows.length !== 1;
        }
        if (deleteBtn) {
            deleteBtn.disabled = checkedRows.length === 0;
        }
        if (completeBtn) {
            completeBtn.disabled = checkedRows.length === 0;
        }
    }

    // =============== API 호출 함수 ===============
    /**
     * 데이터 검색 
     */
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

        fetch(`/api/inbound/list?${params}`)
            .then(response => {
                if (!response.ok) throw new Error('데이터 조회 요청이 실패했습니다.');
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
                }
            });
    }

    /**
     * 데이터 삭제 API 호출
     */
    function deleteInboundData(inNos) {
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        fetch('/api/inbound/bulk-delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({inNos: inNos})
        })
        .then(response => {
            if (!response.ok) throw new Error('삭제 요청이 실패했습니다.');
            return response.json();
        })
        .then(result => {
            if (result.success) {
                Swal.fire('삭제 완료', `${inNos.length}건의 입고 정보가 삭제되었습니다.`, 'success');
                search();
            }
        });
    }

    // =============== 이벤트 핸들러 함수 ===============
    /**
     * 수정 기능 처리
     */
    function modify() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '수정할 입고 정보를 선택해 주세요.', 'info');
            return;
        }
        if (selectedRows.length > 1) {
            Swal.fire('알림', '한 번에 하나의 입고 정보만 수정할 수 있습니다.', 'info');
            return;
        }

        const inNo = selectedRows[0].in_no;
        openPopup(`/inboundPopup?mode=modify&inNo=${inNo}`);
    }

	/**
     * 삭제 기능 처리
     */
    function deleteInbounds() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '삭제할 입고 정보를 선택해 주세요.', 'info');
            return;
        }

        const inNos = selectedRows.map(row => row.in_no);
        
        Swal.fire({
            title: '삭제 확인',
            text: `선택한 ${selectedRows.length}건의 입고 정보를 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteInboundData(inNos);
            }
        });
    }

    /**
     * 상태 변경 처리
     */
    function changeStatus(inNo) {
        Swal.fire({
            title: '상태 변경',
            text: '입고 상태를 완료로 변경하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
                const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

                fetch('/api/inbound/bulk-complete', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: JSON.stringify({
                        inNos: [inNo]
                    })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire({
                            title: '완료',
                            text: '상태가 변경되었습니다.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // 완료 탭으로 이동 및 데이터 새로고침
                            const completeTab = document.querySelector('#complete-tab');
                            if (completeTab) {
                                const tab = new bootstrap.Tab(completeTab);
                                tab.show();
                                setTimeout(() => search(), 100);
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 일괄 완료 처리
     */
    function bulkComplete() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '완료 처리할 입고 정보를 선택해 주세요.', 'info');
            return;
        }

        const inNos = selectedRows.map(row => row.in_no);
        
        Swal.fire({
            title: '입고 완료',
            text: `선택한 ${selectedRows.length}건의 입고를 완료 처리하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
                const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

                fetch('/api/inbound/bulk-complete', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: JSON.stringify({
                        inNos: inNos
                    })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire({
                            title: '완료',
                            text: `${selectedRows.length}건의 입고가 완료 처리되었습니다.`,
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // 완료 탭으로 이동 및 데이터 새로고침
                            const completeTab = document.querySelector('#complete-tab');
                            if (completeTab) {
                                const tab = new bootstrap.Tab(completeTab);
                                tab.show();
                                setTimeout(() => search(), 100);
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 버튼 이벤트 바인딩
     */
    function bindButtonEvents() {
        // 수정 버튼
        const modifyBtn = document.getElementById('modifyBtn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', modify);
        }

        // 삭제 버튼
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', deleteInbounds);
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
        
        // 입고등록 버튼
        const inboundBtn = document.querySelector('.buttons .btn-primary');
        if (inboundBtn) {
            inboundBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openInboundRegistration();
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

    /**
     * 전체 초기화 함수
     */
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

    // DOM 로드 완료 시 초기화 실행
    $(document).ready(function() {
        initialize();
    });
});