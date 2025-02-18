$(function() {	
	// 등록일자는 오늘 날짜로 고정
//	const today = new Date();
//	const yyyy = today.getFullYear();
//	const mm = String(today.getMonth() + 1).padStart(2, '0');
//	const dd = String(today.getDate()).padStart(2, '0');
//	const formattedDate = yyyy + '-' + mm + '-' + dd;
//	$('#plan_date').val(formattedDate);


	// 첫 번째 DatePicker 초기화
//	const container1 = document.getElementById('tui-date-picker-container-1');
//	const target1 = document.getElementById('tui-date-picker-target-1');
//	const instance1 = new tui.DatePicker(container1, {
//		language: 'ko',
//		input: {
//			element: target1,
//			format: 'yyyy-MM-dd'
//		}
//	});

	// 두 번째 DatePicker 초기화
//	const container2 = document.getElementById('tui-date-picker-container-2');
//	const target2 = document.getElementById('tui-date-picker-target-2');
//	const instance2 = new tui.DatePicker(container2, {
//		language: 'ko',
//		input: {
//			element: target2,
//			format: 'yyyy-MM-dd'
//		}
//	});


	
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		rowHeaders: ['checkbox'],
		height: 400,
		bodyHeight: 350,
		columns: [
			{ header: '수주번호', name: 'sale_no', width: 80, sortingType: 'asc', sortable: true },
			{ header: '주문번호', name: 'order_id', width: 100, sortingType: 'asc', sortable: true},
			{ header: '상품번호', name: 'product_no', width: 80, sortingType: 'asc', sortable: true },
			{ header: '상품명', name: 'product_name', width: 200, sortingType: 'asc', sortable: true },
			{ header: '주문단위', name: 'unit_name', width: 80, sortingType: 'asc', sortable: true },
			{ header: '주문량', name: 'sale_vol', width: 80, sortingType: 'asc', sortable: true },
			{ header: '납품기한', name: 'sale_deadline', width: 100, sortingType: 'asc', sortable: true },
			{ header: '거래처', name: 'client_name', width: 100, sortingType: 'asc', sortable: true },
			{ header: '소요시간', name: 'time_sum', width: 100 },
			{ 
	            header: '재고 조회', 
	            name: 'check_mtr',
				width: 80, 
				formatter: (cellData) => {
	                return cellData.value === "등록 가능" || cellData.value === "재고 부족" 
	                    ? cellData.value 
	                    : '<button class="btn btn-warning btn-sm check-stock-btn">조회</button>';
	            },
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
	        
	        axios.get('/api/plan/check/mtr', {
	            params: {
	                product_no: rowData.product_no,
	                sale_vol : rowData.sale_vol
	            },
	        })
	        .then(function (response) {
	            const isAvailable = response.data; // 서버에서 boolean 값이 반환된다고 가정
	            
	            // 결과에 따라 텍스트 변경
	            const newValue = isAvailable ? "등록 가능" : "재고 부족";

	            // Grid에 값 업데이트
	            grid.setValue(ev.rowKey, 'check_mtr', newValue);
	        })
	        .catch(function (error) {
	            console.error('Error fetching data:', error);
	        });
	    }
	});
	
	
});	// 돔 로드 이벤트