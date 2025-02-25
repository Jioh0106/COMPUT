$(function() {	
	const isEditable = role === 'ATHR001' || role === 'ATHR002';
	const csrfToken = $('input[name="_csrf"]').val();
	
	console.log("role:", role);
	console.log("CSRF Token:", csrfToken);
	console.log('isEditable :', isEditable); 
	
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

	
	let grid;
	mainFetchData().then(function (data) {  
		grid = new tui.Grid({
			el: document.getElementById('grid'),
			data: [], 
			height: 600,
			bodyHeight: 550,
			rowHeaders: ['checkbox'],
			columns: [
				{header: '번호', name: 'mtr_no', width: 60, editor: isEditable ? 'text' : null, sortingType: 'asc', sortable: true},
				{header: '자재 이름', name: 'mtr_name', width: 200, editor: isEditable ? 'text' : null},
				{header: '자재 종류', name: 'mtr_type', width: 150, editor: isEditable ? 'text' : null, filter: 'select' },
				{header: '자재 성분', name: 'composition', width: 150, editor: isEditable ? 'text' : null},
				{header: '경도/강도', name: 'hardness', width: 100, editor: isEditable ? 'text' : null},
				{header: '밀도 (g/cm³)', name: 'density', width: 100, editor: isEditable ? 'text' : null},
				{header: '융점 (°C)', name: 'melting_point', width: 100, editor: isEditable ? 'text' : null},
				{header: '인장 강도 (MPa)', name: 'tensile_strength', width: 100, editor: isEditable ? 'text' : null},
				{header: '주요 용도', name: 'mtr_use', width: 150, editor: isEditable ? 'text' : null},
				{
					header: '자재 단위', 
					name: 'unit_name', 
					width: 100, 				
					editor : {
						type: 'select',
						options: {listItems: data.unitCommon}
					},
				},
				{
					header: '등록일', 
					name: 'mtr_reg_data', 
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
					name: 'mtr_mod_data', 
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
				{header: '사용여부', name: 'mtr_status', width: 80, editor: isEditable ? 'text' : null, filter: 'select' },
			],
			editing: isEditable  // 편집 기능 활성화
		});

	});
	
	// 주문 관리 그리드 데이터 초기화
	axios.get('/api/material/list')
	.then(function (response) {
		const data = response.data; // 데이터 로드
		console.log('Fetched data:', data);
	    grid.resetData(data);
	    grid.refreshLayout(); // 레이아웃 새로고침
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
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
		
		// 행 추가 시 신청일 현재 시간으로 세팅
		const now = new Date(); // 현재 날짜와 시간 가져오기
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
		const day = String(now.getDate()).padStart(2, '0');
		let request_date = `${year}-${month}-${day}`;
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			mtr_no: maxNo +1,
			mtr_name: '',
			mtr_type: '',
			composition: '',
			hardness: '',
			density: '',
			melting_point: '',
			tensile_strength: '',
			mtr_use: '',
			mtr_unit: '',
			mtr_reg_data: request_date,
			mtr_mod_data: '',
			mtr_status: 'Y'
		};
		
		// 새 행을 TOAST UI Grid에 추가
		grid.prependRow(newRow, {
			focus: true // 추가된 행에 포커스
		});
		
	}); // 추가 버튼 이벤트
	
	// "저장" 버튼 클릭 이벤트
	$('#save').on('click', async function () {
		grid.blur();
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
		    Swal.fire({ icon: 'error',title: '모든 항목을 입력하세요.', text: '자재명은 필수 항목입니다.',});
		    return; // 저장 중단
		}
	    
		sendToServer(modifiedRows);
		
	}); // 저장 클릭 이벤트
	
	
	
	// "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		if (selectedRows.length === 0) {
			Swal.fire({ icon: "warning",title: "삭제할 항목을 선택하세요."})
	        return;
	    }
		
		const deleteList = selectedRows.map(row => row.mtr_no);
		
		axios.post('/api/material/delete', deleteList, {
			headers: {
			        'X-CSRF-TOKEN': csrfToken
			    }
		})
	    .then(function (response) {
			Swal.fire('Success', '삭제가 완료되었습니다.', 'success' )
	        window.location.reload();
	    })
	    .catch(function (error) {
	        console.error('삭제 중 오류 발생:', error);
			Swal.fire('Error','삭제 중 문제가 발생했습니다.','error' )
	    });
		
	}); // 삭제 버튼 이벤트
	
	
	// 수정/추가 컬럼 반영
	function sendToServer(modifiedRows) {
		const payload = {
		    updatedRows: modifiedRows.updatedRows,
		    createdRows: modifiedRows.createdRows, 
			unit_name: modifiedRows.createdRows.unit_name
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