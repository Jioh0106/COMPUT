// toast ui datepiker
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
const instance2 = new tui.DatePicker(container2, {
	date: new Date(),
	input: {
		element: target2,
		format: 'yyyy-MM-dd'
	}
});


// toast ui 그리드
const Grid = tui.Grid;

const exInfoList = new Grid({
  el: document.getElementById('grid'), // Container element
  columns: [
    { 
		header: '입사일자', 
		name: 'emp_hire_date',
		filter: {
		            type: 'date',
		            options: {
		              format: 'yyyy-MM-dd',
					}
				}
	},
    { 
		header: '사원번호', 
		name: 'emp_num',
		filter : { type: 'text', showApplyBtn: true, showClearBtn: true }
	},
    { 
		header: '성명', 
		name: 'emp_name',
		filter : { type: 'text', showApplyBtn: true, showClearBtn: true }
	},
    { 
		header: '부서명', 
		name: 'emp_dept',
		filter : 'select'
	},
    { 
		header: '직급명', 
		name: 'emp_position',
		filter : 'select'
	},
    { header: 'E-mail', name: 'emp_email'}
  ],
  data: [] // 초기 데이터 비워둠
});

$.ajax({
       url: '/api/test1', // Spring Boot에서 정의한 엔드포인트
       method: 'GET',
       success: function(response) {
		
			console.log(response);
			exInfoList.resetData(response); // 데이터 로드
       },
       error: function(error) {
           console.error('Error fetching data:', error);
       }
   });

// 그리드에서 로우 클릭 이벤트 추가
exInfoList.on('click', function (ev) {
    const rowKey = ev.rowKey; // 클릭된 로우의 인덱스
    const clickedRowData = exInfoList.getData()[rowKey];  // 해당 로우 데이터 가져오기

    // 모달에 데이터 설정
    showModal(clickedRowData);
});

Grid.applyTheme('clean'); // 테마 적용

// 모달에 데이터 표시 함수
function showModal(data) {
	
    const modalBody = document.querySelector('#psDatailModal .modal-body');

    // 기존 모달 내용 초기화
    modalBody.innerHTML = `
        <p><b>입사일자:</b> ${data.emp_hire_date}</p>
        <p><b>사원번호:</b> ${data.emp_num}</p>
        <p><b>성명:</b> ${data.emp_name}</p>
        <p><b>부서명:</b> ${data.emp_dept}</p>
        <p><b>직급명:</b> ${data.emp_position}</p>
        <p><b>E-mail:</b> ${data.emp_email}</p>
    `;

    // 모달을 표시
    const modal = new bootstrap.Modal(document.getElementById('psDatailModal'));
    modal.show();
}

// 팝업 창 띄우기
function popUp() {
    const width = 730;
    const height = 750;

    // 현재 창의 중앙 좌표 계산
    const left = (window.innerWidth - width) / 2 + window.screenLeft;
    const top = (window.innerHeight - height) / 2 + window.screenTop; 

    // 팝업 창 열기
    window.open('/ps-insert', 'popup', `width=${width}, height=${height}, left=${left}, top=${top}`);
}

