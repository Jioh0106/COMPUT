$(function() {	
	const isEditable = role === 'ATHR001' || role === 'ATHR002';
	const csrfToken = $('input[name="_csrf"]').val();
	
	console.log("role:", role);
	console.log("CSRF Token:", csrfToken);
	console.log('isEditable :', isEditable); 
	
	tui.DatePicker.localeTexts.ko = {
		titles: {
			DD: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
			D: ['일', '월', '화', '수', '목', '금', '토'],
			MMMM: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			MMM: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
		},
		titleFormat: 'yyyy년 MMM',
		todayFormat: '오늘: yyyy년 MMMM dd일 DD',
		date: 'Date',
		time: 'Time'
	};
	
	let grid;

	grid = new tui.Grid({
		el: document.getElementById('grid'),
		data: data, 
		rowHeaders: ['checkbox'],
		columns: [
			{ header: 'No', name: 'client_no', width: 60, editor: isEditable ? 'text' : null},
			{ 
				header: '거래처명', 
				name: 'client_name', 
				width: 150, 
				filter: { type: 'text', showApplyBtn: true, showClearBtn: true },
				editor: isEditable ? 'text' : null
			},
			{ header: '연락처', name: 'client_tel', width: 120, editor: isEditable ? 'text' : null},
			{ header: '대표자명', name: 'client_boss', width: 100, editor: isEditable ? 'text' : null},
			{ header: '담당자명', name: 'client_emp', width: 100, editor: isEditable ? 'text' : null},
			{ header: '우편번호', name: 'client_postcode', width: 80, editor: isEditable ? 'text' : null},
			{ header: '주소', name: 'client_adrress', width: 300, editor: isEditable ? 'text' : null},
			{
				header: '구분', 
				name: 'client_type', 
				width: 100, 
				editor: isEditable
					? {
					type: 'select',
					options: {
                        listItems: [
                            { text: '수주', value: '수주' },
                            { text: '발주', value: '발주' }
                        ]
                    }
			    } : null,
				filter: 'select',
			},
			{
				header: '등록일', 
				name: 'client_date', 
				width: 100, 
				editor: isEditable
					? {
	                type: 'datePicker',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            }
				: null,
	            filter: {
	                type: 'date',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            }
			},
			{
				header: '수정일', 
				name: 'client_update', 
				width: 100, 
				editor: isEditable
					? {
	                type: 'datePicker',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            }
				: null,
	            filter: {
	                type: 'date',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            },
			},
			{ header: '메모', name: 'client_memo', width: 200, editor: isEditable ? 'text' : null},
		],
		editing: isEditable  // 편집 기능 활성화
	});
	
	// "추가" 버튼 클릭 이벤트
	$('#append').on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		// 현재 그리드 데이터를 가져와 client_no의 최대값 계산
	    const gridData = grid.getData();
	    const maxNo = gridData.reduce((max, row) => {
	        const client_no = parseInt(row.client_no, 10);
	        return !isNaN(client_no) && client_no > max ? client_no : max;
	    }, 0);
		
		// 행 추가 시 신청일 현재 시간으로 세팅
		const now = new Date(); // 현재 날짜와 시간 가져오기
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
		const day = String(now.getDate()).padStart(2, '0');
		let request_date = `${year}-${month}-${day}`;
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			client_no: maxNo +1,
			client_name: '',
			client_tel: '',
			client_boss: '', 
			client_emp: '', 
			client_postcode: '', 
			client_adrress: '', 
			client_type: '', 
			client_date: request_date, 
			client_update: '', 
			client_memo: ''
		};
		
		// 새 행을 TOAST UI Grid에 추가
		grid.prependRow(newRow, {
			focus: true // 추가된 행에 포커스
		});
		
	}); // 추가 버튼 이벤트
	
	// "저장" 버튼 클릭 이벤트
	$('#save').on('click', async function () {
		const modifiedRows = grid.getModifiedRows();
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
		    Swal.fire({icon: 'error', title: '모든 항목을 입력하세요.', text: '자재명은 필수 항목입니다.'});
		    return; // 저장 중단
		}
	    
		sendToServer(modifiedRows);
		
	}); // 저장 클릭 이벤트
	
	
	
	// "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		if (selectedRows.length === 0) {
			Swal.fire({ icon: "warning", title: "삭제할 항목을 선택하세요."})
	        return;
	    }
		
		const deleteList = selectedRows.map(row => row.client_no);
		
		axios.post('/api/client/delete', deleteList, {
			headers: {
			        'X-CSRF-TOKEN': csrfToken
			    }
		})
	    .then(function (response) {
			Swal.fire('Success','삭제가 완료되었습니다.','success')
	        window.location.reload();
	    })
	    .catch(function (error) {
	        console.error('삭제 중 오류 발생:', error);
			Swal.fire('Error', '삭제 중 문제가 발생했습니다.','error')
	    });
		
	}); // 삭제 버튼 이벤트
	
	
	// 수정/추가 컬럼 반영
	function sendToServer(modifiedRows) {
		const payload = {
		    updatedRows: modifiedRows.updatedRows,
		    createdRows: modifiedRows.createdRows
		};

	    axios.post('/api/client/save', payload, {
	        headers: {
	            'X-CSRF-TOKEN': csrfToken
	        }
	    })
	    .then(function (response) {
	        Swal.fire('Success', '데이터가 성공적으로 저장되었습니다.', 'success');
			const reversedData = response.data.reverse();
	        grid.resetData(reversedData); 
	    })
	    .catch(function (error) {
	        console.error('데이터 저장 중 오류 발생:', error);
	        Swal.fire('Error', '데이터 저장 중 문제가 발생했습니다.', 'error');
	    });
	}

		
});