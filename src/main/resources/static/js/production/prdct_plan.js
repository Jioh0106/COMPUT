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




$(function() {	
	const csrfToken = $('input[name="_csrf"]').val();
	
	axios.get('/api/plan/reg/list')
	.then(function (response) {
		if(Array.isArray(response.data) && response.data.length > 0) {
			var toastElement = document.querySelector(".toast");
		    var toast = new bootstrap.Toast(toastElement);
		    toast.show();
		}
	})
	.catch(function (error) {
	    console.error('Error fetching data:', error);
	});

	const type = 'PRGR'; // 공통 코드 타입
	
	getCommonList(type).then(function (data) {
	    const statusCheckContainer = $('#statusCheck');

	    // 기존 체크박스 삭제 후 다시 추가 (초기화)
	    statusCheckContainer.find('.form-check:not(:first)').remove(); 

	    data.forEach(item => {
	        if (item.common_detail_code && item.common_detail_name) {
	            const checkboxHtml = `
	                <div class="form-check ms-3">
	                    <input class="form-check-input status-check" type="checkbox" value="${item.common_detail_code}" id="check_${item.common_detail_code}" checked>
	                    <label class="form-check-label" for="check_${item.common_detail_code}">${item.common_detail_name}</label>
	                </div>
	            `;
	            statusCheckContainer.append(checkboxHtml);
	        }
	    });
	});

    // "전체" 체크박스 클릭 시 모든 체크박스 선택/해제
    $(document).on('change', '#checkAll', function () {
        const isChecked = $(this).prop('checked');
        $('.status-check').prop('checked', isChecked);
    });

    // 개별 체크박스가 변경될 때 "전체" 체크 상태 조정
    $(document).on('change', '.status-check', function () {
        const total = $('.status-check').length;
        const checkedCount = $('.status-check:checked').length;
        $('#checkAll').prop('checked', total === checkedCount); // 모두 체크되면 "전체" 체크
    });
		
	

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
	
	$(document).on('change', '.status-check, #checkAll', function () {
	    let checkedValues = [];

	    // "전체" 체크박스가 체크되었을 경우
	    if ($('#checkAll').is(':checked')) {
	        checkedValues.push('checkAll');
	    } else {
	        // 개별 체크된 체크박스의 값을 배열로 저장
	        $('.status-check:checked').each(function () {
	            checkedValues.push($(this).val());
	        });
	    }

	    console.log("선택된 상태 값:", checkedValues);

	    axios.get('/api/plan/list/filter', {
	        params: {
	            checked_values: checkedValues.join(','), // 배열을 콤마로 구분된 문자열로 변환
	        }
	    })
	    .then(function (response) {
	        const newData = response.data;
	        grid.resetData(newData); // 새로운 데이터로 그리드 갱신
	        grid.refreshLayout();
	    })
	    .catch(function (error) {
	        console.error('Error fetching data:', error);
	    });
	});

	// ======================================================================
	
	// 생산 계획 그리드
	
	
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		height: 600,
		bodyHeight: 550,
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '생산계획번호', name: 'plan_id', width: 180, sortingType: 'asc', sortable: true, align: 'center'  },
			{ header: '수주번호', name: 'sale_no', width: 80, sortingType: 'asc', sortable: true, align: 'center'  },
			{ header: '등록 직원', name: 'emp_name', width: 100, sortingType: 'asc', sortable: true, align: 'center' },
			{ header: '상태', name: 'status_name', width: 100, sortingType: 'asc', sortable: true,align: 'center' },
			{ 
				header: '우선순위', 
				name: 'plan_priority', 
				width: 100, 
				sortingType: 'asc', 
				sortable: true,
				editor:{
					type: 'select',
					options: {
                        listItems: [ { text: '일반', value: '일반' }, { text: '긴급', value: '긴급' }]
                    }
			    },
				formatter: (cellData) => {
			        if (cellData.value === "긴급") {
			            return '<span class="text-danger">' + cellData.value + '</span>';
			        }
			       	return '일반';
			    },
				align: 'center'   
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
		            options: {format: 'yyyy-MM-dd',language: 'ko' }
		        },
				align: 'center' 
			},
			{ 
				header: '생산 완료 예정일', 
				name: 'plan_end_date', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
				    type: 'datePicker',
				    options: {format: 'yyyy-MM-dd',language: 'ko' }
				},
				filter: {
		            type: 'date',
		            options: {format: 'yyyy-MM-dd',language: 'ko' }
		        },
				align: 'center' 
			  },
			{ 
				header: '등록 일자', 
				name: 'plan_date', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
	                type: 'datePicker',
	                options: { format: 'yyyy-MM-dd',language: 'ko'  }
	            },
				filter: {
		            type: 'date',
		            options: {format: 'yyyy-MM-dd',language: 'ko' }
		        },
				align: 'center' 
			},
			{ 
				header: '수정 일자', 
				name: 'plan_update', 
				sortingType: 'asc', 
				sortable: true,
				editor: {
	                type: 'datePicker',
	                options: {format: 'yyyy-MM-dd',language: 'ko'}
	            },
				filter: {
		            type: 'date',
		            options: {format: 'yyyy-MM-dd',language: 'ko' }
		        },
				align: 'center' 
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
