
// 휴가신청서 팝업창 가운데 위치(듀얼모니터 포함)
function openView() {
	var popupW = 800;
	var popupH = 550;
	var left = (document.body.clientWidth / 2) - (popupW / 2);
	left += window.screenLeft;	 //듀얼 모니터
	var top = (screen.availHeight / 2) - (popupH / 2);
	window.open('/work-add', 'work_add', 'width=' + popupW + ',height=' + popupH + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=no,toolbar=no,titlebar=no,menubar=no,location=no')
}


// =========================================================================

// 근무 일정 그리드

let grid;

grid = new tui.Grid({
	el: document.getElementById('grid'),
	columns: [
		{header: 'No', name: 'work_no'},
		{header: '사원번호', name: 'emp_id'},
		{header: '사원명', name: 'emp_name'},
		{header: '부서', name: 'emp_dept'},
		{header: '근무일자', name: 'work_date'},
		{header: '시작시간', name: 'work_start'},
		{header: '종료시간', name: 'work_end'},
		{header: '휴게시간', name: 'rest_time'},
		{header: '근무시간', name: 'work_time'},
		{header: '근무 템플릿', name: 'work_tmp_name'},
		{header: '근무유형', name: 'work_tmp_name'}
	],
	data: [] // 서버에서 전달받은 데이터
});

// =========================================================================


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
                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
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
	date: date,
	input: {
		element: target2,
		format: 'yyyy-MM-dd'
	}
});

