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
	var toastElement = document.querySelector(".toast");
    var toast = new bootstrap.Toast(toastElement);
    toast.show();
	
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
		rowHeaders: ['checkbox'],
		columns: [
			{ header: '생산계획번호', name: 'plan_id', width: 150, sortingType: 'asc', sortable: true  },
			{ header: '수주번호', name: 'sale_no', width: 80, sortingType: 'asc', sortable: true  },
			{ header: '등록 직원', name: 'emp_name', width: 100 },
			{ header: '상태', name: 'status_name', width: 80 },
			{ header: '우선순위', name: 'plan_priority', width: 80 },
			{ header: '생산 시작 예정일', name: 'plan_start_date', sortingType: 'asc', sortable: true  },
			{ header: '생산 완료 목표일', name: 'plan_end_date', sortingType: 'asc', sortable: true  },
			{ header: '등록 일자', name: 'plan_date', sortingType: 'asc', sortable: true  },
			{ header: '수정 일자', name: 'plan_update', sortingType: 'asc', sortable: true  },
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
