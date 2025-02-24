$(function() {

	function mainFetchData() {
		    
		    return Promise.all([
		         getCommonList('SHFT'), 
		         getCommonList('OCPT'), 
		    ])
		    .then(function ([shftCommon, ocptCommon]) {
		        return {
		            shftCommon: shftCommon.map(item => ({
		                text: item.common_detail_name,
		                value: item.common_detail_name
		            })),
					ocptCommon: ocptCommon.map(item => ({
		                text: item.common_detail_name,
		                value: item.common_detail_name
		            }))
		        };
		    })
		    .catch(function (error) {
		        console.error('Error fetching data:', error);
		        return { shftCommon: [],  ocptCommon: []};
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
		

	// ===================================================================================

	let grid;
	mainFetchData().then(function (data) {
		grid = new tui.Grid({
			el: document.getElementById('tmp-grid'),
			height: 300,
			bodyHeight: 250,
			columns: [
				{ header: '템플릿명', name: 'work_tmp_name', align: 'center', editor: 'text'},
				{ header: '근무 시작 시간', name: 'work_start', align: 'center', editor: 'text'},
				{ header: '근무 종료 시간', name: 'work_end', align: 'center', editor: 'text'},
				{ 
					header: '근무 유형', 
					name: 'shift_name', 
					align: 'center', 				
					editor : {
						type: 'select',
						options: {listItems: data.shftCommon}
					},
				},
				{ 
					header: '근무 형태', 
					name: 'type_name', 
					align: 'center',
					editor : {
						type: 'select',
						options: {listItems: data.ocptCommon}
					},
				},
				{ header: '근로 시간', name: 'work_time', align: 'center', editor: 'text'},
				{ header: '휴식 시간', name: 'rest_time', align: 'center', editor: 'text'}
			],
			data: [] // 서버에서 전달받은 데이터
		});
		
		
		grid.on('focusChange', (ev) => {
			grid.setSelectionRange({
			    start: [ev.rowKey, 0],
				end: [ev.rowKey, grid.getColumns().length]
			});
			
		});	
	});

	// ====================================== 

	axios.get('/api/work/tmp/list')
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
		
		// 현재 그리드 데이터를 가져와 client_no의 최대값 계산
	    const gridData = grid.getData();
	    const maxNo = gridData.reduce((max, row) => {
	        const buy_no = parseInt(row.buy_no, 10);
	        return !isNaN(buy_no) && buy_no > max ? buy_no : max;
	    }, 0);
		
		
		// 기본값으로 새 행 데이터 생성
		const newRow = {
			work_tmp_name: '',
			work_start: '',
			work_end: '',
			shift_name: '', 
			type_name: '', 
			work_time: '', 
			rest_time: '', 
		};
		
		// 새 행을 TOAST UI Grid에 추가
		grid.prependRow(newRow, {
			focus: true // 추가된 행에 포커스
		});
		
	}); // 추가 버튼 이벤트
	
	// "삭제" 버튼 클릭
	$('#delete').on('click', function (e) {
		e.preventDefault(); // 기본 동작 방지
		
		const selectedRow = grid.getFocusedCell();
		if (selectedRow.rowKey !== null) {
	        grid.removeRow(selectedRow.rowKey);
	    } else {
	        Swal.fire('', '삭제할 행을 선택하세요.', 'warning'); 
	    }
	});
	
	// "저장" 버튼 클릭
	$('#save').on('click', function (e) {
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
		        !row.work_tmp_name ||  
		        !row.work_start ||  
		        !row.work_end ||  
		        !row.shift_name ||  
		        !row.type_name ||  
		        !row.work_time ||  
		        !row.rest_time 
		    );
		});
		
		
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({icon: 'error', title: '모든 항목을 입력하세요.'});
		    return; // 저장 중단
		}
		
		const payload = {
		    updatedRows: modifiedRows.updatedRows,
		    createdRows: modifiedRows.createdRows,
			deletedRows: modifiedRows.deletedRows
		};
		
		Swal.fire({
			  icon: "info",
			  title: "근무 템플릿 변경 저장",
			  text: "추가/삭제/수정한 모든 항목을 저장하시겠습니까?",
			  showCancelButton: true,
			  confirmButtonText: "확인", 
			  cancelButtonText: "취소"    
		}).then((result) => {
		      if (result.isConfirmed) { 
		
				axios.post('/api/work/tmp/save', payload, {
					headers: {
				        'X-CSRF-TOKEN': csrfToken
				    }
				})
				.then(function (response) {
					Swal.fire({
				       icon: "success",
				       title: "Success",
				       text: "저장이 완료되었습니다.",
				       showConfirmButton: true,  // 사용자가 직접 닫아야 함
				       allowOutsideClick: false  // 바깥 클릭 방지
				   }).then(() => {
				       window.location.reload(); // 사용자가 확인 버튼을 누른 후 페이지 리로드
				   });
				})
				.catch(function (error) {
				    console.error('저장 중 오류 발생:', error);
					Swal.fire('Error', '저장 중 문제가 발생했습니다.','error')
				});
			  } 
			  // "취소"를 누르면 아무 동작 없이 닫힘 (기본 동작)
		});
					
				

		
	}); // 저장 클릭 이벤트

	
	

});
