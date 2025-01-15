
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

// 근무형태 셀렉트 박스 (일반직/기술직/계약직) 
$('#ocptSelect').on('click', function () {
    // 이미 데이터가 로드된 경우 추가 요청 방지
    if (this.options.length > 1) {
        return;
    }

    const type = 'OCPT'; 

    getCommonList(type).then(function (data) {
        $('#ocptSelect')
            .empty()
			.append('<option value="" disabled selected>선택하세요</option>');
        data.forEach(item => {
            if (item.common_detail_code && item.common_detail_name) {
                $('#ocptSelect').append(
                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
                );
            }
        });
    });
    
}); // 근무형태 셀렉트 박스

// =============================================================================

let grid;

grid = new tui.Grid({
	el: document.getElementById('emp-grid'),
	data: [], // 초기 데이터
    rowHeaders: ['checkbox'], // 행 헤더: 체크박스 추가
    columns: [
        { header: '사번', name: 'EMP_ID' },
        { header: '이름', name: 'EMP_NAME' },
        { header: '부서', name: 'EMP_DEPT' },
        { header: '직급', name: 'EMP_POSITION' },
        { header: '근무형태', name: 'EMP_JOB_TYPE' }
    ]
});


// ===============================================================================

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

const currentDate = new Date();
const nextMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
const nextMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);


// 첫 번째 DatePicker 초기화
const container1 = document.getElementById('tui-date-picker-container-1');
const target1 = document.getElementById('tui-date-picker-target-1');
const instance1 = new tui.DatePicker(container1, {
	date: nextMonthFirstDay,
	input: {
		element: target1,
		format: 'yyyy-MM-dd'
	}
});

// 두 번째 DatePicker 초기화
const container2 = document.getElementById('tui-date-picker-container-2');
const target2 = document.getElementById('tui-date-picker-target-2');
const instance2 = new tui.DatePicker(container2, {
	date: nextMonthLastDay,
	input: {
		element: target2,
		format: 'yyyy-MM-dd'
	}
});


