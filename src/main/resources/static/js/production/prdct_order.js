// 팝업창 가운데 위치(듀얼모니터 포함)
function openView(type) {
	// 파라미터에 따라 수주등록 or 발주등록 팝업창 열기
	var url = type === 'sale' ? 'reg-sale' : type === 'buy' ? 'reg-buy' : '';
	var popupW = 1000;
	var popupH = 600;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open(url, 'popup', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
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
		let isChecked = $(this).is(':checked');
		$('#sale-check, #buy-check').prop('checked', isChecked);
	});

   // '수주' 또는 '발주' 체크박스 클릭 시
	$('#sale-check, #buy-check').on('change', function () {
		if (!$('#sale-check').is(':checked') || !$('#buy-check').is(':checked')) {
			$('#all-check').prop('checked', false);
		} else {
			$('#all-check').prop('checked', true);
		}
	});
	
	instance1.on('change', function(event) {
	    // 데이터피커 값이 변경될 때마다 처리
	    $('.serch').trigger('change'); // 모든 .serch 요소에 change 이벤트 강제로 발생시키기
	});
	// =========================================================================

	// 주문관리 그리드
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		rowHeaders: ['checkbox'],
		columns: [
			{header: '주문번호', name: 'order_id', sortingType: 'asc', sortable: true},
			{header: '등록 일자', name: 'order_date', sortingType: 'asc', sortable: true},
			{header: '등록 직원', name: 'emp_name', sortingType: 'asc', sortable: true},
			{header: '구분', name: 'order_type', sortingType: 'asc', sortable: true},
			{header: '거래처', name: 'client_name', sortingType: 'asc', sortable: true},
			{header: '주문건수', name: 'count', sortingType: 'asc', sortable: true},
			{header: '수정일자', name: 'order_update', sortingType: 'asc', sortable: true}
		],
		data: [] // 서버에서 전달받은 데이터
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
		
		if ($('#all-check').is(':checked')) {
			check_value = '전체';
		} else {
			if ($('#sale-check').is(':checked')) {
			    check_value = '수주';
			} else if ($('#buy-check').is(':checked')) {
			    check_value = '발주';
			}
		}
		console.log("reg_date=" + reg_date);
		console.log("search_word=" + search_word);
		console.log("check_value=" + check_value);
		
		axios.get('/api/order/list/serch', {
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
		rowHeaders: ['checkbox'],
		columns: [
			{header: '수주번호', name: 'sale_no', width: 60},
			{header: '주문번호', name: 'order_id', width: 120},
			{header: '구분', name: 'order_type', width: 80},
			{header: '거래처명', name: 'client_name', width: 120},
			{header: '상품번호', name: 'product_no', width: 80},
			{header: '상품명', name: 'product_name', width: 200},
			{header: '주문 단위', name: 'unit_name', width: 80},
			{header: '주문량', name: 'sale_vol', width: 80},
			{header: '납품기한', name: 'sale_deadline', width: 100},
			{header: '직원번호', name: 'order_emp', width: 100},
			{header: '등록직원', name: 'emp_name', width: 100},
			{header: '등록일자', name: 'order_date', width: 120},
			{header: '필요자재여부', name: 'required_materials', width: 80},
			{header: '상태', name: 'sale_status', width: 80}
		]
	});
	
	// 주문 상세 - 발주 모달 그리드
	const grid3 = new tui.Grid({
		el: document.getElementById('grid3'),
		data: [], // 서버에서 전달받은 데이터
		rowHeaders: ['checkbox'],
		columns: [
			{header: '발주번호', name: 'buy_no', width: 80},
			{header: '주문번호', name: 'order_id', width: 130},
			{header: '구분', name: 'order_type', width: 80},
			{header: '거래처명', name: 'client_name', width: 80},
			{header: '자재번호', name: 'mtr_no', width: 80},
			{header: '자재명', name: 'mtr_name', width: 150},
			{header: '주문 단위', name: 'unit_name', width: 80},
			{header: '주문량', name: 'buy_vol', width: 80},
			{header: '직원번호', name: 'order_emp', width: 100},
			{header: '등록직원', name: 'emp_name', width: 100},
			{header: '등록일자', name: 'order_date', width: 120},
			{header: '상태', name: 'buy_status', width: 80}
		]
	});
	
	// 주문 관리 상세 모달 열기
	grid.on('click', function (ev) {
		if (typeof ev.rowKey !== 'undefined' && ev.rowKey !== null) {
			const rowData = grid.getRow(ev.rowKey);
			
			if(rowData.order_type === '수주') {
				// 수주 모달창 열기	
				$('#order-sale').modal('show');
		    
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
			$('#order-buy').modal('show');
	    
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
	
	// ============================================
	// 주문 관리 그리드 "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows);
		
	}); // 주문 건 삭제 버튼 이벤트
	
	// 주문 상세 - 수주  "삭제" 버튼 클릭 이벤트
	$('#sale-delete').on('click', function () {
		const selectedRows = grid2.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows);
		
	}); // 수주 삭제 버튼 이벤트
	
	// 주문 상세 - 발주  "삭제" 버튼 클릭 이벤트
	$('#buy-delete').on('click', function () {
		const selectedRows = grid3.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		deleteRow(selectedRows);
		
	}); // 수주 발주 버튼 이벤트
	
	function deleteRow(selectedRows) {
		if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
			Swal.fire({
		        icon: "warning",
		        title: "삭제할 항목을 선택하세요."
			})
	        return;
	    }
		
		
		Swal.fire({
		      icon: "warning",
		      title: "주문 건 삭제",
			  text: "해당 정보를 모두 삭제하시겠습니까?",
		      showCancelButton: true,
		      confirmButtonText: "확인",   // OK 버튼 텍스트
		      cancelButtonText: "취소"     // Cancel 버튼 텍스트
		  }).then((result) => {
		      if (result.isConfirmed) {  // OK 버튼을 눌렀을 경우
		          const deleteList = selectedRows.map(row => row.order_id);
	
		          axios.post('/api/order/delete', deleteList, {
		              headers: { 'X-CSRF-TOKEN': csrfToken }
		          })
		          .then(function (response) {
		              Swal.fire(
		                  'Success',
		                  '삭제가 완료되었습니다.',
		                  'success'
		              ).then(() => {
		                  window.location.reload();  // 삭제 후 새로고침
		              });
		          })
		          .catch(function (error) {
		              console.error('삭제 중 오류 발생:', error);
		              Swal.fire(
		                  'Error',
		                  '삭제 중 문제가 발생했습니다.',
		                  'error'
		              );
		          });
		      } 
		      // "취소"를 누르면 아무 동작 없이 닫힘 (기본 동작)
		  });
	}
	
	
	
	

});	// 돔 로드 이벤트
