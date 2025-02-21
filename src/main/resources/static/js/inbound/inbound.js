// 즉시 실행 함수로 전체 코드 래핑
$(function() {    
    // 그리드 인스턴스 변수
    let pendingGrid = null;
    let completeGrid = null;

    // 데이트피커 옵션 설정
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
	
    // 상태 버튼 렌더러
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

    // 입고등록 팝업 열기
    function openInboundRegistration() {
        var popupW = 700;
        var popupH = 600;
        var left = (window.screen.width / 2) - (popupW / 2);
        var top = (window.screen.height / 2) - (popupH / 2);
        
        window.open('/inboundPopup?' + new Date().getTime(), 'inboundPopup', 
            'width=' + popupW + ',height=' + popupH + 
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }

    // 초기 날짜 설정
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // 데이트피커 초기화 함수
    function initializeDatePickers() {
            // 시작일 데이트피커
            const startDatePicker = new tui.DatePicker('#startDatePicker', {
                ...datePickerOptions,
                date: firstDay,
                input: {
                    element: '#startDate',
                    format: 'yyyy-MM-dd'
                }
            });

            // 종료일 데이트피커
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

	//컬럼 설정
	function createColumn(options) {
	  return {
	    width: options.width,
	    minWidth: options.width,
	    align: 'center',
	    ...options
	  };
	}

	// 기본 컬럼 정의
	function getBaseColumns() {
	  return [
		createColumn({header: '출처', name: 'source', 
		      formatter: ({ value }) => {
		        if (value === 'QC') {
		          return '<div class="source-tag qc-tag"><span class="source-dot"></span>품질검사</div>';
		        } if (value === 'PO') {
		          return '<div class="source-tag po-tag"><span class="source-dot"></span>발주</div>';
		        } if (value === 'MANUAL') {
			      return '<div class="source-tag manual-tag"><span class="source-dot"></span>수동입고</div>';
			    }
		        return value;
		      }
		    }),
	    createColumn({header: '입고번호', name: 'in_no'}),
		createColumn({header: '품목코드', name: 'item_code'}),
	    createColumn({header: '품목명', name: 'item_name', width: 200}),
	    createColumn({header: '품목구분', name: 'item_type',
	      	formatter: (value) => value.value === 'RAW' ? '자재' :
	                           value.value === 'PRODUCT' ? '완제품' :
	                           value.value
			}),
	    createColumn({header: '단위', name: 'item_unit'}),
	    createColumn({header: '입고수량', name: 'in_qty'}),
	    createColumn({header: '입고일자', name: 'in_date'}),
	    createColumn({header: '창고명', name: 'warehouse_name'}),
	    createColumn({header: '구역', name: 'zone'}),
	    createColumn({header: '상태', name: 'status', renderer: {type: StatusButtonRenderer}
	    })
	  ];
	}

	// 완료 탭용 추가 컬럼
	function getCompleteColumns() {
	  const baseColumns = getBaseColumns();
	  return [
	    ...baseColumns,
	    createColumn({header: '승인자', name: 'reg_user'}),
	    createColumn({header: '승인일', name: 'reg_date'})
	  ];
	}

	// 출처에 따라 행 스타일 지정하는 함수
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
	      if (rowData.source === 'QC') {
	        row.classList.add('source-qc');
	      } if (rowData.source === 'PO') {
	        row.classList.add('source-po');
	      } if (rowData.source === 'MANUAL') {
		  row.classList.add('source-manual');
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
	      if (rowData.source === 'QC') {
	        row.classList.add('source-qc');
	      } if (rowData.source === 'PO') {
	        row.classList.add('source-po');
	      }
	    });
	  }
	}

	// 그리드 초기화
	function initializeGrids() {
	        // 기존 그리드 제거
	        if (pendingGrid) {
	            pendingGrid.destroy();
	            pendingGrid = null;
	        }
	        if (completeGrid) {
	            completeGrid.destroy();
	            completeGrid = null;
	        }
	        
	        // 그리드 컨테이너 초기화
	        const pendingContainer = document.getElementById('pendingGrid');
	        const completeContainer = document.getElementById('completeGrid');
	        
	        // 컨테이너가 존재하는지 확인하고 초기화
	        if (!pendingContainer || !completeContainer) {
	            console.error('그리드 컨테이너를 찾을 수 없습니다.');
	            return;
	        }
	        
	        pendingContainer.innerHTML = '';
	        completeContainer.innerHTML = '';

	        // 대기 그리드 초기화 (기본 컬럼)
	        pendingGrid = new tui.Grid({
	            el: document.getElementById('pendingGrid'),
	            columns: getBaseColumns(),
	            data: [],
	            rowHeaders: ['checkbox'],
	            scrollX: true,
	            scrollY: true,
				bodyHeight: 600
	        });

	        // 완료 그리드 초기화 (승인자, 승인일 추가)
	        completeGrid = new tui.Grid({
	            el: document.getElementById('completeGrid'),
	            columns: getCompleteColumns(),
	            data: [],
	            scrollX: true,
	            scrollY: true,
				bodyHeight: 600
	        });

	        // 체크박스 이벤트 처리
	        pendingGrid.on('check', () => updateButtonsState());
	        pendingGrid.on('uncheck', () => updateButtonsState());
	        pendingGrid.on('checkAll', () => updateButtonsState());
	        pendingGrid.on('uncheckAll', () => updateButtonsState());
          
          // 그리드 이벤트에 출처 스타일 적용 등록
          pendingGrid.on('onGridMounted', applySourceStyles);
          pendingGrid.on('onGridUpdated', applySourceStyles);
          completeGrid.on('onGridMounted', applySourceStyles);
          completeGrid.on('onGridUpdated', applySourceStyles);
	    }

    // 버튼 상태 업데이트
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

    // 수정 처리
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
	        var popupW = 700;
	        var popupH = 600;
	        var left = (window.screen.width / 2) - (popupW / 2);
	        var top = (window.screen.height / 2) - (popupH / 2);
	              
	        window.open(`/inboundPopup?mode=modify&inNo=${inNo}`, 'inboundPopup',
	            'width=' + popupW + ',height=' + popupH +
	            ',left=' + left + ',top=' + top + 
	            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
	}

    // 삭제 처리  
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
    
    // 삭제 API 호출
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
            if (!response.ok) {
                throw new Error('삭제 요청이 실패했습니다.');
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                Swal.fire('삭제 완료', `${inNos.length}건의 입고 정보가 삭제되었습니다.`, 'success');
                search();
            }        
		})
    }

    // 상태 변경 처리
	function changeStatus(inNo) {
	    // 모든 데이터에서 해당 inNo를 찾기
	    const allRows = pendingGrid.getData();
	    const rowData = allRows.find(row => row.in_no === inNo);
	    
	    if (!rowData) {
	        console.error('입고 데이터를 찾을 수 없습니다:', inNo);
	        Swal.fire('오류', '입고 데이터를 찾을 수 없습니다.', 'error');
	        return;
	    }
	    
	    // 구역이 미정인지 확인
	    if (!rowData.zone || rowData.zone === '미정') {
	        Swal.fire({
	            title: '처리 불가',
	            text: '구역이 미정인 상태에서는 입고 완료 처리를 할 수 없습니다.',
	            icon: 'warning'
	        });
	        return;
	    }

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
	                        // 완료 탭으로 이동
	                        const completeTab = document.querySelector('#complete-tab');
	                        if (completeTab) {
	                            const tab = new bootstrap.Tab(completeTab);
	                            tab.show();
	                            // 약간의 지연 후 데이터 새로고침
	                            setTimeout(() => {
	                                search();
	                            }, 100);
	                        }
	                    });
	                }
	            })
	            .catch(error => {
	                console.error('상태 변경 실패:', error);
	                Swal.fire('오류', '상태 변경 중 오류가 발생했습니다.', 'error');
	            });
	        }
	    });
	}

    // 팝업 열기
    function openPopup(url) {
        var popupW = 700;
        var popupH = 600;
        var left = (window.screen.width / 2) - (popupW / 2);
        var top = (window.screen.height / 2) - (popupH / 2);
              
        window.open(url, 'inboundPopup',
            'width=' + popupW + ',height=' + popupH +
            ',left=' + left + ',top=' + top + 
            ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no');
    }
	
	// 탭 이벤트 초기화
	function initializeTabEvents() {
	        // 이전에 존재하는 모든 탭 이벤트를 제거
	        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
	        tabElements.forEach(tab => {
	            const bsTab = new bootstrap.Tab(tab);
	            tab.removeEventListener('shown.bs.tab', null);
	        });

	        // mainTab에 새로운 이벤트 리스너 추가
	        const mainTab = document.getElementById('mainTab');
	        if (mainTab) {
	            mainTab.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
	                tab.addEventListener('shown.bs.tab', () => {
	                    const pendingContainer = document.getElementById('pendingGrid');
	                    const completeContainer = document.getElementById('completeGrid');
	                    
	                    // 컨테이너 내용 초기화
	                    if (pendingContainer) pendingContainer.innerHTML = '';
	                    if (completeContainer) completeContainer.innerHTML = '';
	                    
	                    // 그리드 초기화
	                    pendingGrid = null;
	                    completeGrid = null;
	                    
	                    // 새로운 그리드 생성 및 데이터 로드
	                    initializeGrids();
	                    search();
	                });
	            });
	        }
	}
	
    // 검색 기능
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

      fetch(`/api/inbound/list?${params}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('데이터 조회 요청이 실패했습니다.');
          }
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
          }
        });
    }

    // 출처 필터 태그 이벤트 바인딩
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

    // 버튼 이벤트 바인딩
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
			
			// 일괄 완료 처리 버튼 추가
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
            
            // 검색창 엔터키 이벤트 추가
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

	// 일괄 완료 처리 함수 추가
	function bulkComplete() {
	        const selectedRows = pendingGrid.getCheckedRows();
	        if (selectedRows.length === 0) {
	            Swal.fire('알림', '완료 처리할 입고 정보를 선택해 주세요.', 'info');
	            return;
	        }
			
			// 선택된 행들 중 구역이 미정인 항목이 있는지 확인
		    const invalidRows = selectedRows.filter(row => !row.zone || row.zone === '미정');
		    if (invalidRows.length > 0) {
		        Swal.fire({
		            title: '처리 불가',
		            text: '구역이 미정인 입고 건이 포함되어 있어 완료 처리를 할 수 없습니다.',
		            icon: 'warning'
		        });
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
	                            // 완료 탭으로 이동
	                            const completeTab = document.querySelector('#complete-tab');
	                            if (completeTab) {
	                                const tab = new bootstrap.Tab(completeTab);
	                                tab.show();
	                                setTimeout(() => {
	                                    search();
	                                }, 100);
	                            }
	                        });
	                    }
	                })
	            }
	        });
	    }
	
    // 초기화 및 이벤트 바인딩
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

    // 초기화 실행
    $(document).ready(function() {
        initialize();
    });
});