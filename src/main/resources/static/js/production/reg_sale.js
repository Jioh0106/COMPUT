$(function() {	
	// 등록일자는 오늘 날짜로 고정
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const formattedDate = yyyy + '-' + mm + '-' + dd;
	$('#order_date').val(formattedDate);

	// 그리드 수정 시 공통코드 셀렉트값 가져오기
	function mainFetchData() {
	    
	    return Promise.all([
	         getCommonList('UNIT'), 
	    ])
	    .then(function ([unitCommon]) {
	        return {
	            unitCommon: unitCommon.map(item => ({
	                text: item.common_detail_name,
	                value: item.common_detail_name
	            }))
	        };
	    })
	    .catch(function (error) {
	        console.error('Error fetching data:', error);
	        return { unitCommon: [] };
	    });
	}
	
	// type으로 공통 코드 가져오는 함수
	function getCommonList(type) {
	    return axios.get(`/api/absence/common/list/${type}`)
	        .then(function (response) {
	            return response.data; // 데이터 반환
	        })
	        .catch(function (error) {
	            console.error('Error fetching data:', error);
				Swal.fire(
				        'Error',
				        '데이터를 가져오는 중 문제가 발생했습니다.',
				        'error'
				      )
	            return []; // 에러 발생 시 빈 배열 반환
	        });
	}
	
	
	// =========================================================================

	const csrfToken = $('input[name="_csrf"]').val();
	
	// 수주 등록 그리드
	let grid;
	
	mainFetchData().then(function (data) {  
		grid = new tui.Grid({
			el: document.getElementById('grid'),
			data: [], 
			columns: [
				{ header: 'No', name: 'sale_no', width: 60 },
				{ header: '상품번호', name: 'product_no', width: 80, editor: 'text' },
				{ header: '상품명', name: 'product_name', width: 230, editor: 'text'  },
				{
					header: '주문단위', 
					name: 'sale_unit',
					width: 100,
					editor : {
						type: 'select',
						options: {
							listItems: data.unitCommon
		                }
					}
				},
				{
					header: '주문량', 
					width: 100,
					name: 'sale_vol', 
					editor: 'text'
				},
				{
					header: '납품기한', 
					name: 'sale_deadline',
					width: 120,
					editor: {
	                    type: 'datePicker',
	                    options: {
	                        format: 'yyyy-MM-dd', 
	                    }
	                }
				},
				{
					header: '수주 상태', 
					name: 'sale_status',
					width: 100,
					editor: {
						type: 'select',
						options: {
	                        listItems: [
	                            { text: '정상', value: '정상' },
	                            { text: '취소', value: '취소' }
	                        ]
	                    }
				    }
				}
			],
			editing: true
		});
		
		
		// 상품번호/상품명 수정 시 모달창에서 상품 조회 후 등록
	    grid.on('editingStart', function (ev) {
	    	const { rowKey, columnName } = ev;

	        // 사원번호 또는 사원명 수정 시 모달 띄우기
	        if (columnName === 'product_no' || columnName === 'product_name') {
	            ev.stop(); // 기본 편집 동작 중단
				
				// 행정보 전달
	            showPrdctModal(rowKey);
	        }
	        
	    });
		
	});


	// ========================================================================== 

	// "추가" 버튼 클릭 이벤트
	$('#appendRow').on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		// 현재 그리드 데이터를 가져와 client_no의 최대값 계산
	    const gridData = grid.getData();
	    const maxNo = gridData.reduce((max, row) => {
	        const sale_no = parseInt(row.sale_no, 10);
	        return !isNaN(sale_no) && sale_no > max ? sale_no : max;
	    }, 0);
		
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			sale_no: maxNo +1,
			product_no: '',
			product_name: '',
			sale_unit: '', 
			sale_vol: '', 
			sale_deadline: '', 
			sale_status: '', 
		};
		
		// 새 행을 TOAST UI Grid에 추가
		grid.appendRow(newRow, {
			focus: true // 추가된 행에 포커스
		});
		
	}); // 추가 버튼 이벤트
	
	
	let modalGrid1;
	let modalGrid2;
	let selectedClientRow = null;
	let selectedPrdctRow = null;
	
	// 거래처 입력 박스 클릭 시 모달창 열기
	$('#client_name').on('click', function (e) {
		e.preventDefault(); 
			
		const modal = $('#clientSerchModal'); // 거래처 검색 모달

		if (!modalGrid1) {
		    modalGrid1 = new tui.Grid({
		        el: document.getElementById('modal-grid1'), 
		        data: [],
		        columns: [
		            { header: '번호', name: 'client_no', width: 60,filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '거래처명', name: 'client_name', width: 100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '연락처', name: 'client_tel', width: 100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '대표자명', name: 'client_boss', width: 80,filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '담당자명', name: 'client_emp', width: 80, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '우편번호', name: 'client_postcode', width: 80 },
		            { 
						header: '등록일자', 
						name: 'client_date', 
						width: 100, 					
						filter: {
					        type: 'date',
					        options: {
					            format: 'yyyy-MM-dd'
					        }
					    }
 					},
		            { header: '주소', name: 'client_adrress', width: 300}
		        ]
		    });
			
			// 행 클릭 이벤트: 사용자가 행을 클릭하면 selectedClientRow에 해당 데이터를 저장
		    modalGrid1.on('click', function (ev) {
		        if (typeof ev.rowKey !== 'undefined') {
		            selectedClientRow = modalGrid1.getRow(ev.rowKey);
		            // 선택 효과를 주기 위해 선택된 행을 표시 (선택 효과가 필요한 경우)
		            modalGrid1.setSelection([ev.rowKey]);
		        }
		    });
		}

		// 모달 열릴 때 입력 필드와 그리드 초기화
		modal.on('show.bs.modal', function () {
			axios.get('/api/order/serch/client', {
				params: {
					type: '수주',
				},
			})
			.then(function (response) {
				const data = response.data; // 데이터 로드
				console.log('Fetched data:', data);
			    modalGrid1.resetData(data);
			    modalGrid1.refreshLayout(); // 레이아웃 새로고침
			})
			.catch(function (error) {
			    console.error('Error fetching data:', error);
			});

		});

		// 모달창 표시
		modal.modal('show');
		
		// "확인" 버튼 클릭 이벤트 핸들러 추가
		$('#clientSerchModalConfirm').off('click').on('click', function () {
			if (selectedClientRow) {
			    $('#client_name').val(selectedClientRow.client_name);
			    $('#client_no').val(selectedClientRow.client_no);
			    modal.modal('hide');
			} else {
			    Swal.fire('Error', '선택된 항목이 없습니다.', 'warning');
			}
		});
		
	});	// 거래처 선택 모달창
	
	// 상품 선택 모달창
	function showPrdctModal(rowKey) { 
		const modal = $('#prdctSerchModal'); // 거래처 검색 모달
		
		if (!modalGrid2) {
		    modalGrid2 = new tui.Grid({
		        el: document.getElementById('modal-grid2'), 
		        data: [],
		        columns: [
		            { header: '상품번호', name: 'product_no', width:60, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '상품명', name: 'product_name', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '상품단위', name: 'unit_name', width:80, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '등록일자', name: 'product_date', width:100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		          
		        ]
		    });
			
			// 행 클릭 이벤트: 사용자가 행을 클릭하면 selectedClientRow에 해당 데이터를 저장
		    modalGrid2.on('click', function (ev) {
		        if (typeof ev.rowKey !== 'undefined') {
		            selectedPrdctRow = modalGrid2.getRow(ev.rowKey);
		            modalGrid2.setSelection([ev.rowKey]);
		        }
		    });
		}	
	
		// 모달 열릴 때 입력 필드와 그리드 초기화
		modal.on('show.bs.modal', function () {
			axios.get('/api/order/serch/prdct')
			.then(function (response) {
				const data = response.data; // 데이터 로드
				console.log('Fetched data:', data);
			    modalGrid2.resetData(data);
			    modalGrid2.refreshLayout(); // 레이아웃 새로고침
			})
			.catch(function (error) {
			    console.error('Error fetching data:', error);
			});

		});

		// 모달창 표시
		modal.modal('show');
		
		// "확인" 버튼 클릭 이벤트 핸들러 추가
		$('#prdctModalConfirm').off('click').on('click', function () {
			if (selectedPrdctRow) {
				grid.setValue(rowKey, 'product_no', selectedPrdctRow.product_no); 
		        grid.setValue(rowKey, 'product_name', selectedPrdctRow.product_name); 
				modal.modal('hide');
			} else {
			    Swal.fire('Error', '선택된 항목이 없습니다.', 'warning');
				
			}
		});
		
		
	} // 상품 선택 모달창

	
	// 수주 등록 버튼 클릭 이벤트
	$('#appendOrder').on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		let client_no = $('#client_no').val();
		let order_date = $('#order_date').val();
		
		if(client_no === '' || client_no === null) {
			Swal.fire('Error', '거래처를 입력해 주세요.', 'warning');
			return;
		}
		const modifiedRows = grid.getModifiedRows();
		console.log(modifiedRows); 
		
		if (modifiedRows.createdRows.length === 0) {
		    Swal.fire('Info', '추가 버튼을 눌러 수주 내용을 등록해 주세요.', 'info');
		    return;
		}
		
		const invalidRows = modifiedRows.createdRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
			return (
			    !row.product_no || 
			    !row.product_name || 
			    !row.sale_unit ||
			    !row.sale_vol || 
			    !row.sale_deadline || 
			    !row.sale_status
			);
		});
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({
		        icon: 'error',
		        title: '모든 항목을 입력하세요.',
		    });
		    return; // 저장 중단
		}
		
		sendToServer(modifiedRows.createdRows, client_no, order_date);
		
	});	// 수주 등록 버튼 클릭 이벤트
	
	function sendToServer(createdRows, client_no, order_date) {
		const param = {
			createdRows : createdRows,
			client_no : client_no,
			order_date : order_date
		}

	    axios.post('/api/order/save/sale', param, {
	        headers: {
	            'X-CSRF-TOKEN': csrfToken
	        }
	    })
	    .then(function (response) {
	        Swal.fire('Success', '데이터가 성공적으로 저장되었습니다.', 'success');
			window.opener.location.reload();
			window.close();
	    })
	    .catch(function (error) {
	        console.error('데이터 저장 중 오류 발생:', error);
	        Swal.fire('Error', '데이터 저장 중 문제가 발생했습니다.', 'error');
	    });
	}
	
});	// 돔 로드 이벤트

	

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