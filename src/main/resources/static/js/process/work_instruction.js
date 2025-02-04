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
				{header: '지시번호', name: 'wi_no', sortable: true},
				{header: '계획번호', name: 'plan_no', sortable: true},
				{header: '품목번호', name: 'product_no', sortable: true},
				{header: '품목', name: 'product_name'},
				{header: 'BOM번호', name: 'bom_no'},
				{header: '공정', name: 'process_name', editor: {
														type: 'select',
														options: {
														listItems: [
															{ text: '가공', value: '가공' },
															{ text: '조립', value: '조립' }
														]
														}}, filter : 'select'},
				{header: '라인', name: 'line_name', editor: {
																type: 'select',
																options: {
																listItems: [
																	{ text: '라인1', value: '라인1' },
																	{ text: '라인2', value: '라인1' }
																]
																}}, filter : 'select'},
				{header: '설비', name: 'equ_name', editor: {
															type: 'select',
															options: {
															listItems: [
																{ text: '설비1', value: '설비1' },
																{ text: '설비2', value: '설비2' }
															]
															}}, filter : 'select'},
				{header: '상태', name: 'wi_status',	editor: 'text', sortable: true},
				{header: '작업시작시간', name: 'cDate'},
				{header: '작업완료시간', name: 'udDate'},
				{header: '작업담당자', name: 'emp_id'},
			],
			data: [],
			columnOptions: {
			  resizable: true
			}
		});
		
		// id 및 rowType 숨기기
		//workInstructionGrid.hideColumn("no");
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
				{header: '부서', name: 'dept',	editor: 'text', sortable: true},
				{header: '직급', name: 'position',	editor: {
													            type: 'select',
													            options: {
													              listItems: [
													                { text: 'Y', value: 'Y' },
													                { text: 'N', value: 'N' },
													              ]
									        				 }}, filter : 'select'},
				{header: '연락처', name: 'phone', editor: 'text'},
				{header: '이메일', name: 'email'},
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
		});
		//workInstructionGrid.hideColumn("no");
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
				{header: '자재번호', name: 'mtl_no', sortable: true},
				{header: '자재명', name: 'mtl_name', sortable: true},
				{header: '창고', name: 'warehouse', sortable: true},
				{header: '구역', name: 'zone', sortable: true},
				{header: '출고수량', name: 'out_qty', sortable: true}
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
		});
		
		//materialGrid.hideColumn("no");
};

