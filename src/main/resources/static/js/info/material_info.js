$(function() {	
	const isEditable = role === 'ATHR001' || role === 'ATHR002';
	const csrfToken = $('input[name="_csrf"]').val();
	
	console.log("role:", role);
	console.log("CSRF Token:", csrfToken);
	console.log('isEditable :', isEditable); 
	
	let grid;

	grid = new tui.Grid({
		el: document.getElementById('grid'),
		data: data, 
		rowHeaders: ['checkbox'],
		columns: [
			{header: '자재번호', name: 'mtr_no', editor: isEditable ? 'text' : null},
			{header: '지재명', name: 'mtr_name', editor: isEditable ? 'text' : null},
			{header: '최소단위', name: 'ress_unit', editor: isEditable ? 'text' : null},
			{header: '사용 단위', name: 'use_unit', editor: isEditable ? 'text' : null},
			{header: '사용여부', name: 'mtr_status', editor: isEditable ? 'text' : null},
		],
		editing: isEditable  // 편집 기능 활성화
	});
	
	// "추가" 버튼 클릭 이벤트
	$('#append').on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		// 현재 그리드 데이터를 가져와 ABSENCE_NO의 최대값 계산
	    const gridData = grid.getData();
	    const maxNo = gridData.reduce((max, row) => {
	        const mtr_no = parseInt(row.mtr_no, 10); // ABSENCE_NO를 숫자로 변환
	        return !isNaN(mtr_no) && mtr_no > max ? mtr_no : max;
	    }, 0);
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			mtr_no: maxNo +1,
			mtr_name: '',
			ress_unit: '',
			use_unit: '', 
			mtr_status: '', 
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
		        !row.mtr_name 
		    );
		});
	
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({
		        icon: 'error',
		        title: '모든 항목을 입력하세요.',
		        text: '자재명은 필수 항목입니다.',
		    });
		    return; // 저장 중단
		}
	    
		sendToServer(modifiedRows);
		
	}); // 저장 클릭 이벤트
	
	
	
	// "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		if (selectedRows.length === 0) {
			Swal.fire({
			        icon: "warning",
			        title: "삭제할 항목을 선택하세요."
			})
	        return;
	    }
		
		const deleteList = selectedRows.map(row => row.mtr_no);
		
		axios.post('/api/material/delete', deleteList, {
			headers: {
			        'X-CSRF-TOKEN': csrfToken
			    }
		})
	    .then(function (response) {
			Swal.fire(
			        'Success',
			        '삭제가 완료되었습니다.',
			        'success'
			      )
	        window.location.reload();
	    })
	    .catch(function (error) {
	        console.error('삭제 중 오류 발생:', error);
			Swal.fire(
			        'Error',
			        '삭제 중 문제가 발생했습니다.',
			        'error'
			      )
	    });
		
	}); // 삭제 버튼 이벤트
	
	
	// 수정/추가 컬럼 반영
	function sendToServer(modifiedRows) {
		const payload = {
		    updatedRows: modifiedRows.updatedRows,
		    createdRows: modifiedRows.createdRows
		};

	    axios.post('/api/material/save', payload, {
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