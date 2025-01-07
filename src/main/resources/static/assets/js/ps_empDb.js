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

const exInfoList = new Grid({
  el: document.getElementById('grid'), // Container element
  columns: [
    { header: '사원번호', name: 'emp_num'},
    { header: '성명', name: 'emp_name'},
    { 
		header: '생년월일', 
		name: 'emp_birth',
		filter: {
		            type: 'date',
		            options: {
		              format: 'yyyy-MM-dd',
					}
				}
	},
    { 
		header: '성별', 
		name: 'emp_gender',
		filter : 'select'
	},
    { 
		header: '결혼여부', 
		name: 'emp_marital_status',
		filter : 'select'
	},
	{ 
		header: '학력',
		name: 'emp_edu',
		filter : 'select'
	},
	{ 
		header: '자격증',
		name: 'emp_cert',
		filter : 'select'
	},
	{ header: '연락처', name: 'emp_phone'},
    { header: 'E-mail', name: 'emp_email'}
  ],
  data: [] // 초기 데이터 비워둠
});

/*$.ajax({
       url: '/api/test1', // Spring Boot에서 정의한 엔드포인트
       method: 'GET',
       success: function(response) {
		
			console.log(response);
			exInfoList.resetData(response); // 데이터 로드
       },
       error: function(error) {
           console.error('Error fetching data:', error);
       }
   });*/

Grid.applyTheme('clean'); // 테마 적용


