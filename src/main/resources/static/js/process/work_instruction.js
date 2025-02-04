// spring security token
const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

// toast ui datepiker
function datePiker(containerSelector, inputSelector){
	return new tui.DatePicker(containerSelector,{
		date : new Date(),
		input : {
			element: inputSelector,
			format: 'yyyy-MM-dd'
		},
		language : 'ko'
	});
}

// toast ui Select Box
function selectBox(idSelector,placeholderText/*data*/){
	return new tui.SelectBox(idSelector,{
		placeholder: placeholderText,
		data:[
				{label:'가공',value:'가공'},
				{label:'열처리',value:'열처리'},
				{label:'조립',value:'조립'},
				{label:'표면처리',value:'표면처리'}
			],
		//data:data,
	});
}

window.onload = function() { 
	
	// 데이트 피커 생성
	const startDatePicker = datePiker('#tui-date-picker-container1','#startDate');
	const endDatePicker = datePiker('#tui-date-picker-container2','#endDate');

	// 데이트 피커 초기값 설정
	startDatePicker.setNull();
	endDatePicker.setNull();
	
	// select box 생성
	selectBox("#processSelectBox","공정 선택");
	selectBox("#lineSelectBox","라인 선택");
	
	// 그리드 생성
	createWorkInstructionGrid();
	createWorkerGrid();
	document.getElementById('tab-material-tab').addEventListener('click',createMaterialGrid);
};

// 그리드 초기값
let workInstructionGrid = "";
let workerGrid = "";
let materialGrid = "";

function createWorkInstructionGrid(){
		//const data = [];//processList;
		//console.log("processList:", data);
		var Grid = tui.Grid;

		if (workInstructionGrid) {
			// 이미 생성된 경우 destroy하지 않고 재사용
			workInstructionGrid.refreshLayout();
			return;
		}
		
		workInstructionGrid = new Grid({
			el: document.getElementById('workInstructionGrid'),
			rowHeaders: ['checkbox'],
			bodyHeight: 280,
			columns: [
				{header: '지시번호', name: 'no', sortable: true},
				{header: '공정명', name: 'name',	editor: 'text'},
				{header: '공정우선순위', name: 'priority',	editor: 'text', sortable: true},
				{header: '사용여부', name: 'isActive',	editor: {
													            type: 'select',
													            options: {
													              listItems: [
													                { text: 'Y', value: 'Y' },
													                { text: 'N', value: 'N' },
													              ]
													            }}, filter : 'select'},
				{header: '설명', name: 'description', editor: 'text'},
				{header: '생성일', name: 'cDate'},
				{header: '수정일', name: 'udDate'},
				{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
			],
			data: [],
			columnOptions: {
			  resizable: true
			}
		});
		
		// id 및 rowType 숨기기
		//workInstructionGrid.hideColumn("no");
		workInstructionGrid.hideColumn("rowType");
};

function createWorkerGrid(){
	
		//const data = processList;
		//console.log("processList:", data);
		var Grid = tui.Grid;
		
		// 탭 활성화
		document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
		document.getElementById('tab-worker').classList.add("active");
		
		if (workerGrid) {
			// 이미 생성된 경우 destroy하지 않고 재사용
			workerGrid.refreshLayout();
			return;
		}
		
		workerGrid = new Grid({
			el: document.getElementById('workerGrid'),
			rowHeaders: ['checkbox'],
			bodyHeight: 280,
			columns: [
				{header: '사원번호', name: 'no', sortable: true},
				{header: '사원명', name: 'name',	editor: 'text'},
				{header: '부서', name: 'priority',	editor: 'text', sortable: true},
				{header: '직급', name: 'isActive',	editor: {
													            type: 'select',
													            options: {
													              listItems: [
													                { text: 'Y', value: 'Y' },
													                { text: 'N', value: 'N' },
													              ]
									        				 }}, filter : 'select'},
				{header: '연락처', name: 'description', editor: 'text'},
				{header: '이메일', name: 'cDate'},
				{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
		});
		//workInstructionGrid.hideColumn("no");
		workerGrid.hideColumn("rowType");
};

function createMaterialGrid(){
		//const data = processList;
		//console.log("processList:", data);
		var Grid = tui.Grid;
		
		// 탭 활성화
		document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
		document.getElementById('tab-material').classList.add("active");
		
		if (materialGrid) {
			// 이미 생성된 경우 destroy하지 않고 재사용
			materialGrid.refreshLayout();
			return;
		}
		
		materialGrid = new Grid({
			el: document.getElementById('materialGrid'),
			rowHeaders: ['checkbox'],
			bodyHeight: 280,
			columns: [
				{header: '자재번호', name: 'no', sortable: true},
				{header: '자재명', name: 'name',	editor: 'text'},
				{header: '공정우선순위', name: 'priority',	editor: 'text', sortable: true},
				{header: '사용여부', name: 'isActive',	editor: {
													            type: 'select',
													            options: {
													              listItems: [
													                { text: 'Y', value: 'Y' },
													                { text: 'N', value: 'N' },
													              ]
													            }}, filter : 'select'},
				{header: '설명', name: 'description', editor: 'text'},
				{header: '생성일', name: 'cDate'},
				{header: '수정일', name: 'udDate'},
				{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
		});
		
		//materialGrid.hideColumn("no");
		materialGrid.hideColumn("rowType");
		
};

