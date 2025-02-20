$(function() {	
	const csrfToken = $('input[name="_csrf"]').val();
	
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
			{ header: '거래처', name: 'client_name', width: 100, sortingType: 'asc', sortable: true },
			{ header: '소요시간', name: 'time_sum', width: 100 },
			{ header: '납품기한', name: 'sale_deadline', width: 100, sortingType: 'asc', sortable: true },
			{
				header: '생산 시작 예정일', 
				name: 'plan_start_date', 
				width: 100, 
				editor: {
	                type: 'datePicker',
	                options: { format: 'yyyy-MM-dd', language: 'ko' }
				}
			},
			{
				header: '생산 시작 종료일', 
				name: 'plan_end_date', 
				width: 100, 
				editor: {
	                type: 'datePicker',
	                options: { format: 'yyyy-MM-dd', language: 'ko'}
				}
			},
			{ 
				header: '우선순위', 
				name: 'plan_priority', 
				width: 80, 			
				editor: {
					type: 'select',
					options: {
                        listItems: [
                            { text: '일반', value: '일반' },
                            { text: '긴급', value: '긴급' }
                        ]
                    }
			    },
				formatter: (cellData) => {
			        if (cellData.value === "긴급") {
			            return '<span class="text-danger">' + cellData.value + '</span>';
			        }
			    } 
			},
			{ 
	            header: '재고 조회', 
	            name: 'check_mtr',
				width: 80, 
				formatter: (cellData) => {
				    if (cellData.value === "등록 가능") {
				        return '<span class="text-success">' + cellData.value + '</span>';
				    } else if (cellData.value === "재고 부족") {
				        return '<span class="text-secondary">' + cellData.value + '</span>';
				    }
				    return '<button class="btn btn-warning btn-sm check-stock-btn">조회</button>';
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
	            const isAvailable = response.data; 
	            const newValue = isAvailable ? "등록 가능" : "재고 부족";
	            grid.setValue(ev.rowKey, 'check_mtr', newValue);
	        })
	        .catch(function (error) {
	            console.error('Error fetching data:', error);
	        });
	    }
	});
	
	// 생산 시작 예정일 입력 시 소요시간 계산하여 종료 예정일 자동 입력
	grid.on('afterChange', (ev) => {
	    ev.changes.forEach(change => {
	        if (change.columnName === 'plan_start_date') {
	            const rowKey = change.rowKey;
	            const startDateStr = change.value; // 입력된 생산 시작 예정일 (문자열)
	            const timeSum = grid.getValue(rowKey, 'time_sum'); // 소요시간 가져오기
	            
	            if (startDateStr && timeSum) {
	                const startDate = new Date(startDateStr);
	                const daysToAdd = Math.ceil(timeSum / 24); // 소요시간을 24로 나누어 일 수 계산
	                startDate.setDate(startDate.getDate() + daysToAdd); // 날짜 더하기

	                const endDateStr = startDate.toISOString().split('T')[0]; // yyyy-MM-dd 포맷
	                grid.setValue(rowKey, 'plan_end_date', endDateStr); // 종료일 업데이트
	            }
	        }
	    });
	});
	
	// "생산 계획 등록" 버튼 클릭 이벤트
	$('#regPlan').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		// 체크된 항목이 없을 경우
		if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
		    Swal.fire({icon: "warning", title: "등록할 항목을 선택하세요."});
		    return;
		}
		
		// 빈 항목 검사
		const invalidRows = selectedRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
		    return (
		        !row.plan_start_date ||
		        !row.plan_end_date ||
		        !row.plan_priority 
		    );
		});
		
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({icon: 'error', title: '모든 항목을 입력하세요.'});
		    return; 
		}
		
		// 재고 조회 여부 검사
		const unCheckedStockRows = selectedRows.filter(row => {
			return row.check_mtr !== "등록 가능" && row.check_mtr !== "재고 부족";
		});

		if (unCheckedStockRows.length > 0) {
			Swal.fire({ icon: 'warning', title: '재고 조회는 필수입니다.' });
			return;
		}
		
		// 등록 가능 항목인지 검사
		const insufficientStockRows = selectedRows.filter(row => row.check_mtr === "재고 부족");

		if (insufficientStockRows.length > 0) {
			Swal.fire({ icon: 'error', title: '재고가 부족한 항목은 등록할 수 없습니다.' });
			return;
		}
		
		// 등록 진행 요청 API
		Swal.fire({
		      icon: "info",
		      title: "생산 계획 등록",
			  text: "새로운 생산 계획으로 등록하시겠습니까?",
		      showCancelButton: true,
		      confirmButtonText: "확인", 
		      cancelButtonText: "취소"    
		  }).then((result) => {
		      if (result.isConfirmed) { 
	
				  axios.post('/api/plan/reg', selectedRows, {
			  			headers: {
			  		        'X-CSRF-TOKEN': csrfToken
			  		    }
			  		})
			  	    .then(function (response) {
			  			Swal.fire('Success','생산 계획 등록이 완료되었습니다.','success')
			  			window.opener.location.reload();
			  			window.close();
			  	    })
			  	    .catch(function (error) {
			  	        console.error('생산 계획 등록 중 오류 발생:', error);
			  			Swal.fire('Error','생산 계획 등록 중 문제가 발생했습니다.','error')
			  	    });
		      } 
		      // "취소"를 누르면 아무 동작 없이 닫힘 (기본 동작)
		  });
		
	}); // 생산 계획 등록 버튼 이벤트

	
});	// 돔 로드 이벤트