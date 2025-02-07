// 팝업창 가운데 위치(듀얼모니터 포함)
function openView(type) {
	// 파라미터에 따라 수주등록 or 발주등록 팝업창 열기
	var url = type === 'sale' ? 'reg-sale' : type === 'buy' ? 'reg-buy' : '';
	var popupW = 1000;
	var popupH = 650;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open(url, 'popup', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
}
// =========================================================================


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

// 등록일 검색 DatePicker 초기화
const container1 = document.getElementById('tui-date-picker-container-1');
const target1 = document.getElementById('tui-date-picker-target-1');
const instance1 = new tui.DatePicker(container1, {
	language: 'ko',
	date: [],
	input: {
		element: target1,
		format: 'yyyy-MM-dd'
	}
});

// =========================================================================
$(function() {	
	
	// 부서 셀렉트 박스 
	$('#deptSelect').on('click', function () {
	    // 이미 데이터가 로드된 경우 추가 요청 방지
	    if (this.options.length > 1) {
	        return;
	    }
	
	    const type = 'DEPT'; 
	
	    getCommonList(type).then(function (data) {
	        $('#deptSelect')
	            .empty()
				.append('<option value="" disabled selected>선택하세요</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#deptSelect').append(
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


	// =========================================================================

	// 주문관리 그리드

	let grid;

	grid = new tui.Grid({
		el: document.getElementById('grid'),
		columns: [
			{header: '주문번호', name: 'order_id'},
			{header: '등록 일자', name: 'order_date'},
			{header: '등록 직원', name: 'order_emp'},
			{header: '구분', name: 'order_type'},
			{header: '거래처', name: 'client_no'},
			{header: '주문건수', name: ''},
			{header: '수정일자', name: 'order_update'}
		],
		data: [] // 서버에서 전달받은 데이터
	});

	// ====================================== 
	// 그리드 데이터 초기화
	let ger_date = '';
	console.log("start : "  + start);
	console.log("end : "  + end);

	axios.get('/api/order/list', {
		params: {
			date: ger_date,
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
	
	// ============================================
	// 검색 버튼 클릭 시 그리드 데이터 초기화
	$('#serch').on('click', function() {
		grid.resetData([]);
		
		let start = instance1.getDate().toLocaleDateString('en-CA');  
		let end = instance2.getDate().toLocaleDateString('en-CA');
		let dept = $('#deptSelect').val() ||'';
		let emp_info = $('#searchEmp').val() || '';
		console.log("start : "  + start);
		console.log("end : "  + end);
		console.log("dept : "  + dept);
		console.log("emp_info : "  + emp_info);
		
		
		axios.get('/api/work/list/serch', {
			params: { start, end, dept, emp_info }
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
			
		
		
	});
		
		
		
	

});	
