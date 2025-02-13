$(function() {	
	// 등록일자는 오늘 날짜로 고정
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const formattedDate = yyyy + '-' + mm + '-' + dd;
	$('#plan_date').val(formattedDate);
	
	
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '수주번호', name: 'sale_no' },
			{ header: '주문번호', name: 'order_id' },
			{ header: '상품번호', name: 'product_no' },
			{ header: '상품명', name: 'product_name' },
			{ header: '주문단위', name: 'sale_unit' },
			{ header: '주문량', name: 'sale_vol' },
			{ header: '납품기한', name: 'sale_deadline' },
			{ header: '거래처', name: 'client_name' },
			{ header: '재고 조회', name: 'client_name' }
		],
		data: [] // 서버에서 전달받은 데이터
	});
	
	
	axios.get('/api/plan/list')
	.then(function (response) {
		const data = response.data; // 데이터 로드
		console.log('Fetched data:', data);
	    grid.resetData(data);
	    grid.refreshLayout(); // 레이아웃 새로고침
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
	});

		
	
	
	
});	// 돔 로드 이벤트