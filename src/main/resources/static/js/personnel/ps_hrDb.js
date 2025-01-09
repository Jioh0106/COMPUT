// toast ui datepiker
// 첫 번째 DatePicker 초기화
/*const container1 = document.getElementById('tui-date-picker-container-1');
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
});*/


// toast ui 그리드
const Grid = tui.Grid;
Grid.applyTheme('clean'); // 테마 적용
const exInfoList = new Grid({
  el: document.getElementById('grid'), // Container element
  columns: [
    // { header: '사원번호', name: 'emp_num'}, hidden으로
    { header: '성명', name: 'emp_name'},
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
	{ 
		header: '고용유형',
		name: 'emp_job_type',
		filter : 'select'
	},
	{ 
		header: '재직상태',
		name: 'emp_status',
		filter : 'select'
	},
	{ 
		header: '입사일', 
		name: 'emp_hire_date',
		filter: {
		            type: 'date',
		            options: {
		              format: 'yyyy-MM-dd',
					}
				}
	},
	{ 
		header: '퇴사일', 
		name: 'emp_hire_date',
		filter: {
		            type: 'date',
		            options: {
		              format: 'yyyy-MM-dd',
					}
				}
	},
	{ 
		header: '평가분기',
		name: 'emp_qtr_eval',
		filter : 'select'
	},
	{ 
		header: '성과등급',
		name: 'emp_qtr_eval',
		filter : 'select'
	}
  ],
  data: [] // 초기 데이터 비워둠
});




