/**
 * 출고 관리 모듈
 */
$(function() {    
    // =============== 전역 변수 선언 ===============
    let pendingGrid = null;    // 대기 상태 그리드
    let completeGrid = null;   // 완료 상태 그리드

    // =============== 상수 정의 ===============
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

    // 날짜 관련 상수
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

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
                el.innerHTML = '출고대기';
                el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rowKey = props.rowKey;
                    const rowData = grid.getRow(rowKey);
                    changeStatus(rowData.out_no);
                };
            } else {
                el.className = 'btn btn-sm btn-success';
                el.innerHTML = '출고완료';
                el.disabled = true;
            }
        }
    }

    /**
     * 출처 태그 렌더러 클래스
     * 그리드 내 출처를 태그 형태로 표시
     */
    class SourceTagRenderer {
        constructor(props) {
            this.el = document.createElement('div');
            this.render(props);
        }

        getElement() {
            return this.el;
        }

		render(props) {
		    const el = this.el;
		    const source = props.value;
		    
		    if (source === 'MTI') {
		        el.innerHTML = '<div class="source-tag material-tag"><span class="source-dot"></span>자재투입</div>';
		    } else if (source === 'PSH') {
		        el.innerHTML = '<div class="source-tag product-tag"><span class="source-dot"></span>제품출고</div>';
		    } else {
		        el.innerHTML = source || '';
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
            createColumn({header: '출처', name: 'source', renderer: {type: SourceTagRenderer}}),
            createColumn({header: '출고번호', name: 'out_no'}),
            createColumn({header: '품목명', name: 'item_name', width: 200}),
            createColumn({
                header: '품목구분', 
                name: 'item_type',
                formatter: (value) => value.value === 'RAW' ? '자재' :
                    value.value === 'PRODUCT' ? '완제품' :
                    value.value
            }),
            createColumn({header: '단위', name: 'item_unit'}),
            createColumn({header: '출고수량', name: 'out_qty'}),
            createColumn({header: '출고일자', name: 'out_date'}),
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

        const gridOptions = {
            bodyHeight: 400,
            minBodyHeight: 400,
            scrollX: true,
            scrollY: true
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
        
        // 그리드 이벤트에 출처 스타일 적용 등록
        pendingGrid.on('onGridMounted', applySourceStyles);
        pendingGrid.on('onGridUpdated', applySourceStyles);
        completeGrid.on('onGridMounted', applySourceStyles);
        completeGrid.on('onGridUpdated', applySourceStyles);
    }

    /**
     * 출처에 따라 행 스타일 지정하는 함수
     */
	function applySourceStyles() {
	    const pendingRows = pendingGrid?.el.querySelectorAll('.tui-grid-row');
	    const completeRows = completeGrid?.el.querySelectorAll('.tui-grid-row');
	    
	    // 대기 그리드에 스타일 적용
	    if (pendingRows) {
	        pendingRows.forEach(row => {
	            const rowKey = row.getAttribute('data-row-key');
	            if (rowKey === null) return;
	            
	            const rowData = pendingGrid.getRow(parseInt(rowKey, 10));
	            if (!rowData) return;
	            
	            // 출처별 스타일 적용
				if (rowData.source === 'MTI') {
				    row.classList.add('source-material');
				} else if (rowData.source === 'PSH') {
				    row.classList.add('source-product');
				}
	        });
	    }
	    
	    // 완료 그리드에 스타일 적용
	    if (completeRows) {
	        completeRows.forEach(row => {
	            const rowKey = row.getAttribute('data-row-key');
	            if (rowKey === null) return;
	            
	            const rowData = completeGrid.getRow(parseInt(rowKey, 10));
	            if (!rowData) return;
	            
	            // 출처별 스타일 적용
	            if (rowData.source === 'MATERIAL') {
	                row.classList.add('source-material');
	            } else if (rowData.source === 'PRODUCT') {
	                row.classList.add('source-product');
	            }
	        });
	    }
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
                    initializeGrids();
                    search();
                });
            });
        }
    }

    /**
     * 출처 필터 태그 이벤트 바인딩
     */
    function bindSourceFilterEvents() {
        const filterTags = document.querySelectorAll('.source-filter-tag');
        
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                // 활성 태그 갱신
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                
                // 검색 실행
                search();
            });
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

    // =============== 팝업 관련 함수 ===============
    /**
     * 출고등록 팝업 열기
     */
    function openOutboundRegistration() {
        const popupW = 700;
        const popupH = 600;
        const left = (window.screen.width / 2) - (popupW / 2);
        const top = (window.screen.height / 2) - (popupH / 2);
        
        window.open('/outboundPopup?' + new Date().getTime(), 'outboundPopup', 
            'width=' + popupW + ',height=' + popupH + 
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    // =============== 데이터 처리 함수 ===============
    /**
     * 데이터 검색 
     */
    function search() {
        const searchInput = document.getElementById('searchInput')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const activeTab = document.querySelector('.nav-link.active')?.id;
        const status = activeTab === 'pending-tab' ? '대기' : '완료';
        
        // 활성화된 출처 필터 가져오기
        const activeSourceTag = document.querySelector('.source-filter-tag.active');
        const source = activeSourceTag ? activeSourceTag.getAttribute('data-source') : '';

        const params = new URLSearchParams({
            startDate: startDate,
            endDate: endDate,
            keyword: searchInput,
            status: status,
            source: source
        });

        fetch(`/api/outbound/list?${params}`)
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
                        
                        // 데이터 로드 후 출처 스타일 적용
                        setTimeout(applySourceStyles, 100);
                    }
                } else {
                    throw new Error('데이터 조회 결과가 없습니다.');
                }
            });
    }

    /**
     * 수정 기능 처리
     */
    function modify() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '수정할 출고 정보를 선택해 주세요.', 'info');
            return;
        }
        if (selectedRows.length > 1) {
            Swal.fire('알림', '한 번에 하나의 출고 정보만 수정할 수 있습니다.', 'info');
            return;
        }

        const outNo = selectedRows[0].out_no;
        const popupW = 700;
        const popupH = 600;
        const left = (window.screen.width / 2) - (popupW / 2);
        const top = (window.screen.height / 2) - (popupH / 2);
              
        window.open(`/outboundPopup?mode=modify&outNo=${outNo}`, 'outboundPopup',
            'width=' + popupW + ',height=' + popupH +
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    /**
     * 삭제 기능 처리
     */
    function deleteOutbounds() {
        const selectedRows = pendingGrid.getCheckedRows();
        if (selectedRows.length === 0) {
            Swal.fire('알림', '삭제할 출고 정보를 선택해 주세요.', 'info');
            return;
        }

        const outNos = selectedRows.map(row => row.out_no);
        
        Swal.fire({
            title: '삭제 확인',
            text: `선택한 ${selectedRows.length}건의 출고 정보를 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
                const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

                fetch('/api/outbound/bulk-delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: JSON.stringify({outNos: outNos})
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire('삭제 완료', result.message, 'success');
                        search();
                    } else {
                        throw new Error(result.message || '삭제 처리에 실패했습니다.');
                    }
                });
            }
        });
    }

    /**
     * 상태 변경 처리
     * @param {number} outNo - 출고 번호
     */
    function changeStatus(outNo) {
        Swal.fire({
            title: '출고완료 처리',
            text: '출고 상태를 완료로 변경하시겠습니까?',
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
                        outNos: [outNo]
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
                                setTimeout(() => search(), 100);
                            }
                        });
                    } else {
                        throw new Error(result.message || '상태 변경에 실패했습니다.');
                    }
                })
				.catch(error => {
	                const errorMessage = error.message || '';
	                if (errorMessage.includes('재고 부족')) {
	                    const match = errorMessage.match(/창고: (.*?), 구역: (.*?), 품목번호: (.*?), 필요수량: (.*?), 현재재고: (.*?)$/);
	                    if (match) {
	                        const [, warehouse, zone, itemNo, needed, current] = match;
	                        Swal.fire({
	                            title: '재고 부족',
	                            html: `
	                                <div class="text-left">
	                                    <div class="mb-2">재고가 부족하여 출고 처리를 완료할 수 없습니다.</div>
	                                    <hr>
	                                    <div class="mt-3">
	                                        <p><strong>창고:</strong> ${warehouse}</p>
	                                        <p><strong>구역:</strong> ${zone}</p>
	                                        <p class="text-danger"><strong>필요수량:</strong> ${needed}</p>
	                                        <p class="text-danger"><strong>현재재고:</strong> ${current}</p>
	                                    </div>
	                                </div>
	                            `,
	                            icon: 'error',
	                            confirmButtonText: '확인'
	                        });
	                    } else {
	                        Swal.fire('오류', errorMessage, 'error');
	                    }
	                } else {
	                    Swal.fire('오류', '출고 완료 처리 중 오류가 발생했습니다.', 'error');
	                }
	            });
	        }
	    });
	}


    /**
     * 일괄 완료 처리
     * 선택된 여러 출고 건을 한 번에 완료 처리
     */
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
                processBulkComplete(outNos);
            }
        });
    }

    /**
     * 일괄 완료 처리 API 호출
     * @param {number[]} outNos - 출고 번호 배열
     */
    function processBulkComplete(outNos) {
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
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '서버 에러가 발생했습니다.');
                });
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                handleBulkCompleteSuccess();
            } else {
                throw new Error(result.message || '처리 중 오류가 발생했습니다.');
            }
        })
        .catch(error => handleBulkCompleteError(error));
    }

    /**
     * 일괄 완료 성공 처리
     */
    function handleBulkCompleteSuccess() {
        Swal.fire({
            title: '완료',
            text: '출고 완료 처리가 되었습니다.',
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
     * 일괄 완료 에러 처리
     * @param {Error} error - 발생한 에러
     */
	function handleBulkCompleteError(error) {
	    const errorMessage = error.message || '';
	    if (errorMessage.includes('재고 부족')) {
	        const match = errorMessage.match(/창고: (.*?), 구역: (.*?), 품목번호: (.*?), 필요수량: (.*?), 현재재고: (.*?)$/);
	        if (match) {
	            const [, warehouse, zone, itemNo, needed, current] = match;
	            Swal.fire({
	                title: '재고 부족',
	                html: `
	                    <div class="text-left">
	                        <div class="mb-2">재고가 부족하여 출고 처리를 완료할 수 없습니다.</div>
	                        <hr>
	                        <div class="mt-3">
	                            <p><strong>창고:</strong> ${warehouse}</p>
	                            <p><strong>구역:</strong> ${zone}</p>
	                            <p class="text-danger"><strong>필요수량:</strong> ${needed}</p>
	                            <p class="text-danger"><strong>현재재고:</strong> ${current}</p>
	                        </div>
	                    </div>
	                `,
	                icon: 'error',
	                confirmButtonText: '확인'
	            });
	        } else {
	            Swal.fire('오류', errorMessage, 'error');
	        }
	    } else {
	        Swal.fire({
	            title: '오류',
	            text: errorMessage || '출고 완료 처리 중 오류가 발생했습니다.',
	            icon: 'error',
	            confirmButtonText: '확인'
	        });
	    }
	}

    /**
     * 전체 초기화 함수
     * 페이지 로드 시 필요한 모든 초기화 작업 수행
     */
    function initialize() {
        initializeDatePickers();
        initializeGrids();
        bindButtonEvents();
        bindSourceFilterEvents(); // 출처 필터 이벤트 바인딩 추가
        initializeTabEvents();

        // 초기 데이터 로드
        search();

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            if (pendingGrid) pendingGrid.refreshLayout();
            if (completeGrid) completeGrid.refreshLayout();
        });
    }

    // =============== 초기화 실행 ===============
    $(document).ready(function() {
        initialize();
    });
});