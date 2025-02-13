
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
	
	// ======================================================================\
	
	// 주문관리 그리드
	const grid = new tui.Grid({
		el: document.getElementById('grid'),
		rowHeaders: ['checkbox'],
		columns: [
			{header: '주문번호', name: 'order_id'},
			{header: '생산계획번호', name: 'plan_id'},
			{header: '등록 직원', name: 'emp_id'},
			{header: '상태', name: 'plan_status'},
			{header: '최초등록일자', name: 'plan_date'},
			{header: '최종수정일자', name: 'plan_update'},
			{header: '생산시작예정일', name: 'plan_start_date'},
			{header: '우선순위', name: 'plan_end_date'}
		],
		data: [] // 서버에서 전달받은 데이터
	});

	// ------------------------------------------------
	// 주문 관리 그리드 데이터 초기화
	let reg_date = '';
	console.log("등록일자 : "  + reg_date);

	axios.get('/api/order/list', {
		params: {
			reg_date: reg_date,
		},
	})
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
