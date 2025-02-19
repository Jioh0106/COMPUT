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
	
	// 상품별 자재 소요량 조회 그리드
	const grid2 = new tui.Grid({
		el: document.getElementById('grid2'),
		columns: [
			{header: 'BOM번호', name: 'BOM_NO'},
			{header: '상품번호', name: 'PRODUCT_NO'},
			{header: '상품이름', name: 'PRODUCT_NAME', width: 200},
			{header: '반제품번호', name: 'MTRPRODUCT_NO'},
			{header: '자재번호', name: 'MTR_NO'},
			{header: '자재명', name: 'MTR_NAME'},
			{header: '단위', name: 'UNIT_NAME'},
			{header: '소요량', name: 'TOTAL_QUANTITY' },
		],
		data: [] // 서버에서 전달받은 데이터
	});
	
	
		
	// 발주 등록 그리드
	let grid; 
	
	mainFetchData().then(function (data) {  
		grid = new tui.Grid({
			el: document.getElementById('grid'),
			height: 300,
			bodyHeight: 250,
			data: [], 
			columns: [
				{ header: 'No', name: 'buy_no' },
				{ header: '자재번호', name: 'mtr_no', editor: 'text' },
				{ header: '자재명', name: 'mtr_name', width:200,  editor: 'text'  },
				{
					header: '주문단위', 
					name: 'buy_unit',
					editor : {
						type: 'select',
						options: {listItems: data.unitCommon}
					}
				},
				{ header: '주문량', name: 'buy_vol', editor: 'text'},
				{
					header: '발주 상태', 
					name: 'buy_status',
					editor: {
						type: 'select',
						options: {
	                        listItems: [ { text: '정상', value: '정상' }, { text: '취소', value: '취소' }]
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
	        if (columnName === 'mtr_no' || columnName === 'mtr_name') {
	            ev.stop(); // 기본 편집 동작 중단
				
				// 행정보 전달
	            showMtrModal(rowKey);
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
	        const buy_no = parseInt(row.buy_no, 10);
	        return !isNaN(buy_no) && buy_no > max ? buy_no : max;
	    }, 0);
		
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			buy_no: maxNo +1,
			mtr_no: '',
			mtr_name: '',
			buy_unit: '', 
			buy_vol: '', 
			buy_status: '정상', 
		};
		
		// 새 행을 TOAST UI Grid에 추가
		grid.appendRow(newRow, {
			focus: true // 추가된 행에 포커스
		});
		
	}); // 추가 버튼 이벤트
	
	// =================================================================================================
	
	let modalGrid1;
	let modalGrid2;
	let modalGrid3;
	let selectedClientRow = null;
	let selectedMtrRow = null;
	let selectedPrdctRow = null;
	// 거래처 입력 박스 클릭 시 모달창 열기
	$('#client_name').on('click', function (e) {
		e.preventDefault(); 
			
		const modal = $('#clientSerchModal'); // 거래처 검색 모달

		if (!modalGrid1) {
		    modalGrid1 = new tui.Grid({
		        el: document.getElementById('modal-grid1'), 
				height: 350,
				bodyHeight: 300,
		        data: [],
		        columns: [
		            { header: '번호', name: 'client_no', width: 60,filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '거래처명', name: 'client_name', width: 100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '연락처', name: 'client_tel', width: 100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '대표자명', name: 'client_boss', width: 80,filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '담당자명', name: 'client_emp', width: 80, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
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
		            { header: '우편번호', name: 'client_postcode', width: 80 },
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
					type: '발주',
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
	
	// =================================================================================================
	// 자재 선택 모달창
	function showMtrModal(rowKey) { 
		const modal = $('#mtrSerchModal'); // 거래처 검색 모달
		
		if (!modalGrid2) {
		    modalGrid2 = new tui.Grid({
		        el: document.getElementById('modal-grid2'), 
				height: 350,
				bodyHeight: 300,
		        data: [],
		        columns: [
		            { header: '자재번호', name: 'mtr_no', width:60, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '자재명', name: 'mtr_name', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '자재종류', name: 'mtr_type', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '자재성분', name: 'composition', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '주요용도', name: 'mtr_use', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '자재단위', name: 'unit_name', width:80, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		            { header: '등록일자', name: 'mtr_reg_data', width:100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
		          
		        ]
		    });
			
			// 행 클릭 이벤트: 사용자가 행을 클릭하면 selectedClientRow에 해당 데이터를 저장
		    modalGrid2.on('click', function (ev) {
		        if (typeof ev.rowKey !== 'undefined') {
		            selectedMtrRow = modalGrid2.getRow(ev.rowKey);
		            modalGrid2.setSelection([ev.rowKey]);
		        }
		    });
		}	
	
		// 모달 열릴 때 입력 필드와 그리드 초기화
		modal.on('show.bs.modal', function () {
			axios.get('/api/order/serch/mtr')
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
		$('#mtrModalConfirm').off('click').on('click', function () {
			if (selectedMtrRow) {
				grid.setValue(rowKey, 'mtr_no', selectedMtrRow.mtr_no); 
		        grid.setValue(rowKey, 'mtr_name', selectedMtrRow.mtr_name); 
				modal.modal('hide');
			} else {
			    Swal.fire('Error', '선택된 항목이 없습니다.', 'warning');
				
			}
		});
	
	} // 자재 선택 모달창
	
	// =================================================================================================
	// 상품 조회 모달창
	$('#product_name').on('click', function (e) {
		e.preventDefault(); 
		const modal = $('#prdctSerchModal'); // 거래처 검색 모달
		
		if (!modalGrid3) {
		    modalGrid3 = new tui.Grid({
		        el: document.getElementById('modal-grid3'), 
				height: 350,
				bodyHeight: 300,
		        data: [],
		        columns: [
		            { header: '상품번호', name: 'product_no', width:60, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '상품명', name: 'product_name', width:200, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }, },
		            { header: '상품단위', name: 'unit_name', width:80, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		            { header: '등록일자', name: 'product_date', width:100, filter: { type: 'text', showApplyBtn: true, showClearBtn: true },},
		          
		        ]
		    });
			
			// 행 클릭 이벤트: 사용자가 행을 클릭하면 selectedClientRow에 해당 데이터를 저장
		    modalGrid3.on('click', function (ev) {
		        if (typeof ev.rowKey !== 'undefined') {
		            selectedPrdctRow = modalGrid3.getRow(ev.rowKey);
		            modalGrid3.selectedPrdctRow([ev.rowKey]);
		        }
		    });
		}	
	
		// 모달 열릴 때 입력 필드와 그리드 초기화
		modal.on('show.bs.modal', function () {
			axios.get('/api/order/serch/prdct')
			.then(function (response) {
				const data = response.data; // 데이터 로드
				console.log('Fetched data:', data);
			    modalGrid3.resetData(data);
			    modalGrid3.refreshLayout(); // 레이아웃 새로고침
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
				$('#product_name').val(selectedPrdctRow.product_name);
				$('#product_no').val(selectedPrdctRow.product_no);
				
				axios.get('/api/order/serch/bom', {
				    params: {  
				        product_no: $('#product_no').val()
				    }
				}) 
				.then(function (response) {
					const data = response.data; // 데이터 로드
					console.log('Fetched data:', data);
				    grid2.resetData(data);
				    grid2.refreshLayout(); // 레이아웃 새로고침
					modal.modal('hide');
				})
				.catch(function (error) {
				    console.error('Error fetching data:', error);
				});
			} else {
			    Swal.fire('Error', '선택된 항목이 없습니다.', 'warning');
			}
		});
			
	}); // 상품 조회 모달창
	
	// =================================================================================================
	$('#appendMtr')	.on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		const mtrList = grid2.getData()
		console.log("✅ 가져온 데이터:", mtrList);
	});
	// =================================================================================================

	// 발주 등록 버튼 클릭 이벤트
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
		    Swal.fire('Info', '추가 버튼을 눌러 발주 내용을 등록해 주세요.', 'info');
		    return;
		}
		
		const invalidRows = modifiedRows.createdRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
			return (
			    !row.mtr_no || 
			    !row.mtr_name || 
			    !row.buy_unit ||
			    !row.buy_vol || 
			    !row.buy_status
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
		
	});	// 발주 등록 버튼 클릭 이벤트
	
	// 데이터 등록 함수
	function sendToServer(createdRows, client_no, order_date) {
		const param = {
			createdRows : createdRows,
			client_no : client_no,
			order_date : order_date
		}

	    axios.post('/api/order/save/buy', param, {
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