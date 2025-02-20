// 팝업창 가운데 위치(듀얼모니터 포함)
function openView(type) {
	// 파라미터에 따라 수주등록 or 발주등록 팝업창 열기
	var url = '/reg-plan';
	var popupW = 1200;
	var popupH = 600;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open(url, 'popup', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
}
// =========================================================================


// 첫 번째 DatePicker 초기화
const container1 = document.getElementById('tui-date-picker-container-1');
const target1 = document.getElementById('tui-date-picker-target-1');
const instance1 = new tui.DatePicker(container1, {
	language: 'ko',
	date: new Date(),
	input: {
		element: target1,
		format: 'yyyy-MM-dd'
	}
});

// 두 번째 DatePicker 초기화
const container2 = document.getElementById('tui-date-picker-container-2');
const target2 = document.getElementById('tui-date-picker-target-2');
const date = new Date();
date.setDate(date.getDate() + 7);
const instance2 = new tui.DatePicker(container2, {
	language: 'ko',
	date: date,
	input: {
		element: target2,
		format: 'yyyy-MM-dd'
	}
});



$(function() {	
	const csrfToken = $('input[name="_csrf"]').val();
	
	axios.get('/api/plan/reg/list')
	.then(function (response) {
		var toastElement = document.querySelector(".toast");
	    var toast = new bootstrap.Toast(toastElement);
	    toast.show();
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
	});

	// 부서 셀렉트 박스 
	$('#statusSelect').on('click', function () {
	    // 이미 데이터가 로드된 경우 추가 요청 방지
	    if (this.options.length > 1) {
	        return;
	    }

	    const type = 'PRGR'; 

	    getCommonList(type).then(function (data) {
	        $('#statusSelect')
	            .empty()
				.append('<option value="" selected>전체</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#statusSelect').append(
	                    $('<option></option>').val(item.common_detail_name).text(item.common_detail_name)
	                );
	            }
	        });
	    });
	    
	}); // 부서 셀렉트 박스 

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
	
	
	// ======================================================================
	
	// 생산 계획 그리드
	
	
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		height: 600,
		bodyHeight: 550,
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '생산계획번호', name: 'plan_id', width: 180, sortingType: 'asc', sortable: true  },
			{ header: '수주번호', name: 'sale_no', width: 80, sortingType: 'asc', sortable: true  },
			{ header: '등록 직원', name: 'emp_name', width: 100 },
			{ header: '상태', name: 'status_name', width: 100,filter: 'select' },
			{ 
				header: '우선순위', 
				name: 'plan_priority', 
				width: 100, 
				editor:{
					type: 'select',
					options: {
                        listItems: [ { text: '일반', value: '일반' }, { text: '긴급', value: '긴급' }]
                    }
			    }  
			},
			{ 
				header: '생산 시작 예정일', 
				name: 'plan_start_date', 
				sortingType: 'asc', 
				sortable: true , 
				editor: {
				    type: 'datePicker',
				    options: {
				        format: 'yyyy-MM-dd',
						language: 'ko' 
				    }
				},			
				filter: {
		            type: 'date',
		            options: {
		                format: 'yyyy-MM-dd',
		                language: 'ko'
		            }
		        } 
			},
			{ 
				header: '생산 완료 예정일', 
				name: 'plan_end_date', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
				    type: 'datePicker',
				    options: {
				        format: 'yyyy-MM-dd',
						language: 'ko' 
				    }
				},
				filter: {
		            type: 'date',
		            options: {
		                format: 'yyyy-MM-dd',
		                language: 'ko'
		            }
		        } 
			  },
			{ 
				header: '등록 일자', 
				name: 'plan_date', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
	                type: 'datePicker',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            },
				filter: {
		            type: 'date',
		            options: {
		                format: 'yyyy-MM-dd',
		                language: 'ko'
		            }
		        }   
			},
			{ 
				header: '수정 일자', 
				name: 'plan_update', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
	                type: 'datePicker',
	                options: {
	                    format: 'yyyy-MM-dd',
						language: 'ko' 
	                }
	            },
				filter: {
		            type: 'date',
		            options: {
		                format: 'yyyy-MM-dd',
		                language: 'ko'
		            }
		        }   
			}
		],
		data: [] // 서버에서 전달받은 데이터
	});
	

	// ------------------------------------------------
	// 생산 계획 그리드 데이터 초기화

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
	
	// "삭제" 버튼 클릭 이벤트
	$('#delete').on('click', function () {
		const selectedRows = grid.getCheckedRows();
		console.log('선택된 데이터:', selectedRows);
		
		if (selectedRows.length === 0) {
			Swal.fire({ icon: "warning", title: "삭제할 항목을 선택하세요."})
	        return;
	    }
		
		// 재고 조회 여부 검사
		const checkRows = selectedRows.filter(row => {
			return row.status_name !== "등록";
		});

		if (checkRows.length > 0) {
			Swal.fire({ icon: 'warning', title: '선택 항목 삭제 불가', text: "작업 지시 중인 항목은 삭제할 수 없습니다."});
			return;
		}

		const deleteList = selectedRows.map(row => row.plan_id);
		Swal.fire({
			  icon: "warning",
			  title: "생산 계획 삭제",
			  text: "선택한 항목을 삭제하시겠습니까?",
			  showCancelButton: true,
			  confirmButtonText: "확인", 
			  cancelButtonText: "취소"    
		}).then((result) => {
		      if (result.isConfirmed) { 
		
				axios.post('/api/plan/delete', deleteList, {
					headers: {
				        'X-CSRF-TOKEN': csrfToken
				    }
				})
				.then(function (response) {
					Swal.fire({
				       icon: "success",
				       title: "Success",
				       text: "삭제가 완료되었습니다.",
				       showConfirmButton: true,  // 사용자가 직접 닫아야 함
				       allowOutsideClick: false  // 바깥 클릭 방지
				   }).then(() => {
				       window.location.reload(); // 사용자가 확인 버튼을 누른 후 페이지 리로드
				   });
				})
				.catch(function (error) {
				    console.error('삭제 중 오류 발생:', error);
					Swal.fire('Error', '삭제 중 문제가 발생했습니다.','error')
				});
			  } 
			  // "취소"를 누르면 아무 동작 없이 닫힘 (기본 동작)
		});
	
		
	}); // 삭제 버튼 이벤트
	
	// "저장" 버튼 클릭 이벤트
	$('#update').on('click', async function () {
		const updatedRows = grid.getModifiedRows().updatedRows;
		console.log(updatedRows); 
		
		if (updatedRows.length === 0) {
	        Swal.fire('Info', '수정된 항목이 없습니다.', 'info');
	        return;
	    }
		
		// 필수 항목 중 빈 필드가 있는지 검사
		const invalidRows = updatedRows.filter(row => {
			console.log('검사 중인 행 데이터:', row); // 디버깅용 출력
		    return (
		        !row.plan_start_date || 
		        !row.plan_end_date || 
		        !row.plan_date
		    );
		});
	
		// 빈 필드가 있는 행이 존재하면 알림 표시 후 중단
		if (invalidRows.length > 0) {
			console.log('유효하지 않은 행:', invalidRows);
		    Swal.fire({icon: 'error', title: '입력이 필요한 항목이 있습니다.'});
		    return; // 저장 중단
		}
	    
		Swal.fire({
			  icon: "info",
			  title: "생산 계획 수정",
			  text: "변경한 항목을 저장하시겠습니까?",
			  showCancelButton: true,
			  confirmButtonText: "확인", 
			  cancelButtonText: "취소"    
		}).then((result) => {
		      if (result.isConfirmed) { 
		
				axios.post('/api/plan/update', updatedRows, {
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
