$(function() {	
	// 등록일자는 오늘 날짜로 고정
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const formattedDate = yyyy + '-' + mm + '-' + dd;
	$('#plan_date').val(formattedDate);


	// 첫 번째 DatePicker 초기화
	const container1 = document.getElementById('tui-date-picker-container-1');
	const target1 = document.getElementById('tui-date-picker-target-1');
	const instance1 = new tui.DatePicker(container1, {
		language: 'ko',
		input: {
			element: target1,
			format: 'yyyy-MM-dd'
		}
	});

	// 두 번째 DatePicker 초기화
	const container2 = document.getElementById('tui-date-picker-container-2');
	const target2 = document.getElementById('tui-date-picker-target-2');
	const instance2 = new tui.DatePicker(container2, {
		language: 'ko',
		input: {
			element: target2,
			format: 'yyyy-MM-dd'
		}
	});


	
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '수주번호', name: 'sale_no', width: 80, sortingType: 'asc', sortable: true },
			{ header: '주문번호', name: 'order_id', width: 100, sortingType: 'asc', sortable: true},
			{ header: '상품번호', name: 'product_no', width: 80, sortingType: 'asc', sortable: true },
			{ header: '상품명', name: 'product_name', width: 200, sortingType: 'asc', sortable: true },
			{ header: '주문단위', name: 'unit_name', width: 80, sortingType: 'asc', sortable: true },
			{ header: '주문량', name: 'sale_vol', width: 80, sortingType: 'asc', sortable: true },
			{ header: '납품기한', name: 'sale_deadline', width: 100, sortingType: 'asc', sortable: true },
			{ header: '거래처', name: 'client_name', width: 100, sortingType: 'asc', sortable: true },
			{ 
	            header: '재고 조회', 
	            name: 'check_mtr',
				width: 80, 
				formatter: () => '<button class="btn btn-warning btn-sm check-stock-btn">조회</button>',
	            align: 'center'
	        }
		],
		data: [] // 서버에서 전달받은 데이터
	});
	
	
	axios.get('/api/plan/reg/list')
	.then(function (response) {
		const data = response.data; // 데이터 로드
		console.log('Fetched data:', data);
	    grid.resetData(data);
	    grid.refreshLayout(); // 레이아웃 새로고침
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
	});

		
	// 버튼 클릭 이벤트 추가
	grid.on('click', (ev) => {
	    if (ev.columnName === 'check_mtr') {
	        const rowData = grid.getRow(ev.rowKey);
	        alert(`재고 조회 요청: 상품번호 ${rowData.product_no}, 상품명 ${rowData.product_name}`);
	        // 여기서 서버에 재고 조회 요청을 보낼 수 있음
			axios.get('/api/plan/check/mtr', {
				params: {
					product_no: rowData.product_no,
					sale_vol : rowData.sale_vol
				},
			})
			.then(function (response) {
				console.log('Fetched data:', data);
			})
			.catch(function (error) {
			    console.error('Error fetching data:', error);
			});
	    }
	});
	
	
});	// 돔 로드 이벤트