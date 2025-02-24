// 팝업창 가운데 위치(듀얼모니터 포함)
function openSaleView() {
	// 파라미터에 따라 수주등록 or 발주등록 팝업창 열기
	var url = 'reg-sale';
	var popupW = 1200;
	var popupH = 600;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open(url, 'sale-view', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
}
function openBuyView() {
	// 파라미터에 따라 수주등록 or 발주등록 팝업창 열기
	var url = 'reg-buy';
	var popupW = 1200;
	var popupH = 800;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open(url, 'buy-view', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
}
// =========================================================================


// 제이쿼리로 데이트피커에 숫자만 입력되게 정규식 처리
function datePickerReplace(id) {
	$(document).ready(function () {
		// 숫자가 아닌 정규식
		var replaceNotInt = /[^0-9]/gi;

		$(`#${id}`).on("focusout", function () {
			var x = $(this).val();
			if (x.length > 0) {
				if (x.match(replaceNotInt)) {
					x = x.replace(replaceNotInt, "");
				}
				$(this).val(x);
			}
		}).on("keyup", function () {
			$(this).val($(this).val().replace(replaceNotInt, ""));
		});
	});
}

// 등록일 검색 DatePicker 초기화
const container1 = document.getElementById('tui-date-picker-container-1');
const target1 = document.getElementById('tui-date-picker-target-1');
const instance1 = new tui.DatePicker(container1, {
	language: 'ko',
	date: [],
	input: {
		element: target1,
		format: 'yyyy-MM-dd'
	}
});

// =========================================================================
$(function() {	
	const csrfToken = $('input[name="_csrf"]').val();
		
	// '전체' 체크박스 클릭 시
	$('#all-check').on('change', function () {
	    $('#sale-check, #buy-check').prop('checked', this.checked);
	});

	// '수주' 또는 '발주' 체크박스 클릭 시
	$('#sale-check, #buy-check').on('change', function () {
	    $('#all-check').prop('checked', $('#sale-check').is(':checked') && $('#buy-check').is(':checked'));
	});
	
	instance1.on('change', function(event) {
	    // 데이터피커 값이 변경될 때마다 처리
	    $('.serch').trigger('change'); // 모든 .serch 요소에 change 이벤트 강제로 발생시키기
	});
	// =========================================================================

	// 주문관리 그리드
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		height: 600,
		bodyHeight: 550,
		rowHeaders: ['checkbox'],
		columns: [
			{header: '주문번호', name: 'order_id', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '등록 일자', name: 'order_date', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '등록 직원', name: 'emp_name', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '구분', name: 'order_type', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '거래처', name: 'client_name', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '주문건수', name: 'count', sortingType: 'asc', sortable: true, align: 'center'},
			{header: '수정일자', name: 'order_update', sortingType: 'asc', sortable: true, align: 'center'}
		],
		data: [] // 서버에서 전달받은 데이터
	});
	
	// 주문 관리 상세 모달 열기
	grid.on('focusChange', (ev) => {
		grid.setSelectionRange({
		    start: [ev.rowKey, 0],
			end: [ev.rowKey, grid.getColumns().length]
		});
		
		if (ev.targetType  === 'rowHeader') {
		       return; 
		   }
			
			if (typeof ev.rowKey !== 'undefined' && ev.rowKey !== null) {
				const rowData = grid.getRow(ev.rowKey);
				$('#order-sale', '#order-buy').on('hidden.bs.modal', function () {
				    $(this).removeAttr('aria-hidden');
				});
				
				if(rowData.order_type === '수주') {

					// 수주 모달창 열기	
					$('#order-sale').modal('show').on('shown.bs.modal',()=> grid2.refreshLayout());

					axios.get('/api/order/detail/sale', {
						params: {
							order_id: rowData.order_id  
						}
					})
					.then(function (response) {
					  const detailData = response.data;
					  
					  grid2.resetData(detailData);
					  grid2.refreshLayout();
					})
					.catch(function (error) {
					  console.error('Error fetching order detail:', error);
					});
					return;
					
				} // 수주 조건문	
				
			;

				// 발주 모달창 열기	
				$('#order-buy').modal('show').on('shown.bs.modal',()=> grid3.refreshLayout());
				
				axios.get('/api/order/detail/buy', {
					params: {
						order_id: rowData.order_id  
					}
				})
				.then(function (response) {
				  const detailData = response.data;
				  
				  grid3.resetData(detailData);
				  grid3.refreshLayout();
				})
				.catch(function (error) {
				  console.error('Error fetching order detail:', error);
				});	
				

					
			}
	
	});	
	// ------------------------------------------------
	// 주문 관리 그리드 데이터 초기화
	axios.get('/api/order/list')
	.then(function (response) {
		const data = response.data; // 데이터 로드
		console.log('Fetched data:', data);
	    grid.resetData(data);
	    grid.refreshLayout(); // 레이아웃 새로고침
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
	});
	
	// ============================================
	// 주문 관리 그리드 필터 검색
	$('.serch').on('change', function () {
		let reg_date = $('#tui-date-picker-target-1').val();
		let search_word = $('#searchWord').val();
		let check_value = '';
		
		check_value = $('#all-check').is(':checked') ? '전체' : 
		              $('#sale-check').is(':checked') ? '수주' : 
		              $('#buy-check').is(':checked') ? '발주' : '';

		axios.get('/api/order/list/filter', {
		    params: {
		        reg_date: reg_date,
		        search_word: search_word,
		        check_value: check_value
		    }
		})
		.then(function (response) {
		    const newData = response.data;
		    grid.resetData(newData);
		    grid.refreshLayout();
		})
		.catch(function (error) {
		    console.error('Error fetching data:', error);
		});
		
			
	}); // 주문 건 삭제 버튼 이벤트
	
	// ============================================
	// 주문 상세 - 수주 모달 그리드
	const grid2 = new tui.Grid({
		el: document.getElementById('grid2'),
		data: [], // 서버에서 전달받은 데이터
		height: 300,
		bodyHeight: 250,
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '수주번호', name: 'sale_no', width: 60, align: 'center'},
			{ header: '주문번호', name: 'order_id', width: 120, align: 'center'},
			{ header: '구분', name: 'order_type', width: 80, align: 'center'},
			{ header: '거래처명', name: 'client_name', width: 120, align: 'center'},
			{ header: '상품번호', name: 'product_no', width: 80, align: 'center'},
			{ header: '상품명', name: 'product_name', width: 200, align: 'center'},
			{ header: '주문 단위', name: 'unit_name', width: 80, align: 'center'},
			{ header: '주문량', name: 'sale_vol', width: 80, align: 'center', editor: 'text'},
			{ header: '납품기한', name: 'sale_deadline', width: 100, align: 'center'},
			{ header: '직원번호', name: 'order_emp', width: 100, align: 'center'},
			{ header: '등록직원', name: 'emp_name', width: 100, align: 'center'},
			{ header: '등록일자', name: 'order_date', width: 120, align: 'center'},
			{
				header: '주문상태', 
				name: 'sale_status', 
				width: 100, 
				align: 'center',
				editor: {
					type: 'select',
					options: {
				        listItems: [ { text: '정상', value: '정상' }, { text: '취소', value: '취소' }]
				    }
				}
			},
			{ header: '계획상태', name: 'plan_status', width: 100, align: 'center'}
		]
	});
	
	// 주문 상세 - 발주 모달 그리드
	const grid3 = new tui.Grid({
		el: document.getElementById('grid3'),
		data: [], // 서버에서 전달받은 데이터
		height: 300,
		bodyHeight: 250,
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '발주번호', name: 'buy_no', width: 80, align: 'center'},
			{ header: '주문번호', name: 'order_id', width: 130, align: 'center'},
			{ header: '구분', name: 'order_type', width: 80, align: 'center'},
			{ header: '거래처명', name: 'client_name', width: 80, align: 'center'},
			{ header: '자재번호', name: 'mtr_no', width: 80, align: 'center'},
			{ header: '자재명', name: 'mtr_name', width: 150, align: 'center'},
			{ header: '주문 단위', name: 'unit_name', width: 80, align: 'center'},
			{ header: '주문량', name: 'buy_vol', width: 80, align: 'center',  editor: 'text'},
			{ header: '직원번호', name: 'order_emp', width: 100, align: 'center'},
			{ header: '등록직원', name: 'emp_name', width: 100, align: 'center'},
			{ header: '등록일자', name: 'order_date', width: 120, align: 'center'},
			{
				header: '주문상태', 
				name: 'buy_status', 
				width: 100, 
				align: 'center',			
				editor: {
					type: 'select',
					options: {
                        listItems: [ { text: '정상', value: '정상' }, { text: '취소', value: '취소' }]
                    }
			    }
			},
			{ header: '입고상태', name: 'inbound_status', width: 100, align: 'center'}
		]
	});
	
	// 주문 관리 상세 모달 열기
	grid.on('click', function (ev) {
		if (ev.targetType  === 'rowHeader') {
			return; 
		}
	
		if (typeof ev.rowKey !== 'undefined' && ev.rowKey !== null) {
			const rowData = grid.getRow(ev.rowKey);
			$('#order-sale').on('hidden.bs.modal', function () {
			    $(this).removeAttr('aria-hidden');
			});
			$('#order-buy').on('hidden.bs.modal', function () {
			    $(this).removeAttr('aria-hidden');
			})
			
			if(rowData.order_type === '수주') {

				// 수주 모달창 열기	
				$('#order-sale').modal('show').on('shown.bs.modal',()=> grid2.refreshLayout());
				
				axios.get('/api/order/detail/sale', {
					params: {
						order_id: rowData.order_id  
					}
				})
				.then(function (response) {
				  const detailData = response.data;
				  grid2.resetData(detailData);
				  grid2.refreshLayout();
				})
				.catch(function (error) {
				  console.error('Error fetching order detail:', error);
				});
				return;
			} // 수주 조건문	
			

			// 발주 모달창 열기	
			$('#order-buy').modal('show').on('shown.bs.modal',()=> grid3.refreshLayout());
			
			axios.get('/api/order/detail/buy', {
				params: {
					order_id: rowData.order_id  
				}
			})
			.then(function (response) {
			  const detailData = response.data;
			  
			  grid3.resetData(detailData);
			  grid3.refreshLayout();
			})
			.catch(function (error) {
			  console.error('Error fetching order detail:', error);
			});	
		}
	});
	
	// 상품번호/상품명 수정 시 모달창에서 상품 조회 후 등록
    grid3.on('editingStart', function (ev) {
    	const { rowKey, columnName } = ev;
        // 사원번호 또는 사원명 수정 시 모달 띄우기
        if (columnName === 'mtr_no' || columnName === 'mtr_name') {
            ev.stop(); // 기본 편집 동작 중단
            showMtrModal(rowKey);
        }
    });
	
	// ============================================
	
//	$('#appendBuy').on('click', function (e) {
//		e.preventDefault(); // 기본 동작 방지
//		
//		const now = new Date();
//		const year = now.getFullYear();
//		const month = String(now.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
//		const day = String(now.getDate()).padStart(2, '0');
//		const hours = String(now.getHours()).padStart(2, '0'); // 시
//		const minutes = String(now.getMinutes()).padStart(2, '0'); // 분
//		let request_date = `${year}-${month}-${day} ${hours}:${minutes}`;
//
//		const gridData = grid3.getData();
//		// 기본값으로 새 행 데이터 생성
//		const newRow = {
//			buy_no: '<spen class="text-body-tertiary">자동입력<span>',
//			order_id: gridData[0].order_id,
//			order_type: gridData[0].order_type,
//			client_name: gridData[0].client_name,
//			mtr_no: '', 
//			mtr_name: '', 
//			unit_name: '',
//			buy_vol: '',
//			order_emp: user.EMP_ID,
//			emp_name: user.EMP_NAME,
//			order_date: request_date,
//			buy_status: '정상',
//			inbound_status: ''
//		};
//		
//		// 새 행을 TOAST UI Grid에 추가
//		grid3.prependRow(newRow, {
//			focus: true // 추가된 행에 포커스
//		});
//	}); 

	$('#saveBuy').on('click', function () {
		grid3.blur();
		const modifiedRows = grid3.getModifiedRows();
		console.log(modifiedRows); 
		
		if (modifiedRows.updatedRows.length === 0 && modifiedRows.createdRows.length === 0) {
	        Swal.fire('Info', '수정 또는 추가된 데이터가 없습니다.', 'info');
	        return;
	    }
		
		// 필수 항목 중 빈 필드가 있는지 검사
		const invalidRows = modifiedRows.createdRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
		    return (
		        !row.client_name 
		    );
		});
	
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({icon: 'error', title: '모든 항목을 입력하세요.'});
		    return; // 저장 중단
		}
	    
		sendToServer(modifiedRows, '발주');
		
	}); 
	
	$('#saveSale').on('click', function () {
		grid2.blur();
		const modifiedRows = grid2.getModifiedRows();
		console.log(modifiedRows); 
		
		if (modifiedRows.updatedRows.length === 0 && modifiedRows.createdRows.length === 0) {
	        Swal.fire('Info', '수정 또는 추가된 데이터가 없습니다.', 'info');
	        return;
	    }
		
		// 필수 항목 중 빈 필드가 있는지 검사
		const invalidRows = modifiedRows.createdRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
		    return (
		        !row.client_name 
		    );
		});
	
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({icon: 'error', title: '모든 항목을 입력하세요.'});
		    return; // 저장 중단
		}
	    
		sendToServer(modifiedRows, '수주');
	}); 

	
	// ============================================
	// 주문 관리 그리드 "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows, 'order');
		
	}); // 주문 건 삭제 버튼 이벤트
	
	// 주문 상세 - 수주  "삭제" 버튼 클릭 이벤트
	$('#sale-delete').on('click', function () {
		const selectedRows = grid2.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows, 'sale');
		
	}); // 수주 삭제 버튼 이벤트
	
	// 주문 상세 - 발주  "삭제" 버튼 클릭 이벤트
	$('#buy-delete').on('click', function () {
		const selectedRows = grid3.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows, 'buy');
		
	}); // 수주 발주 버튼 이벤트
	
	
	function deleteRow(selectedRows, type) {
		if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
			Swal.fire({ icon: "warning", title: "삭제할 항목을 선택하세요."})
	        return;
	    }
		
		Swal.fire({
		      icon: "warning",
		      title: "주문 건 삭제",
			  text: "해당 정보를 모두 삭제하시겠습니까?",
		      showCancelButton: true,
		      confirmButtonText: "확인",   
		      cancelButtonText: "취소"     
		}).then((result) => {
			if (result.isConfirmed) {  
				const deleteList = selectedRows.map(row => row.order_id);
	            const requestData = {
					type: type,       // 'buy' 또는 'sale' 문자열
					orderIds: deleteList  
	            };

				axios.post('/api/order/delete', deleteList, {
					headers: { 'X-CSRF-TOKEN': csrfToken }
				})
				.then(function (response) {
					Swal.fire('Success','삭제가 완료되었습니다.','success')
					.then(() => {
						window.location.reload();  
					});
				})
		          .catch(function (error) {
		              console.error('삭제 중 오류 발생:', error);
		              Swal.fire('Error', '삭제 중 문제가 발생했습니다.', 'error' );
		          });
		      } 
		  });
	}
	
	
	// 수정/추가 컬럼 반영
	function sendToServer(modifiedRows, type) {
		const payload = {
		    updatedRows: modifiedRows.updatedRows,
		    createdRows: modifiedRows.createdRows,
			order_type: type
		};

	    axios.post('/api/order/save/detail', payload, {
	        headers: {
	            'X-CSRF-TOKEN': csrfToken
	        }
	    })
	    .then(function (response) {
	        Swal.fire('Success', '데이터가 성공적으로 저장되었습니다.', 'success');
			const reversedData = response.data;
	        grid.resetData(reversedData); 
	    })
	    .catch(function (error) {
	        console.error('데이터 저장 중 오류 발생:', error);
	        Swal.fire('Error', '데이터 저장 중 문제가 발생했습니다.', 'error');
	    });
		
	}

	

});	// 돔 로드 이벤트