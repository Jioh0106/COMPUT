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
};

// toast ui Select Box
function selectBox(idSelector,placeholderText,fetchData){
	return new tui.SelectBox(idSelector,{
		placeholder: placeholderText,
		data:fetchData
	});
};

// 서버에서 전달받은 정보로 공정 select box 생성
async function fetchProcessInfoList(){
	try{
		const response = await fetch("/api/process-info");
		
		if (!response.ok) {
           	throw new Error("네트워크 응답 실패");
       	}
		
		const processInfoList = await response.json();
		console.log("processInfoList",processInfoList);
		
		const processData = processInfoList.map(item => ({
			label:item.processName,
			value:item.processNo
		}));
		
		// selectBox 생성
		selectBox("#processSelectBox","공정 선택",processData);
		
	}catch(error){
		console.error("error",error);
	}
};

// 서버에서 전달받은 정보로 라인 select box 생성
async function fetchLineInfoList(){
	try{
		const response = await fetch("/api/line-info");
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		
		const lineInfoList = await response.json();
		console.log("lineInfoList",lineInfoList);
		
		const lineDate = lineInfoList.map(item =>({
			label: item.lineName,
			value: item.lineNo
		}));
		
		// selectBox 생성
		selectBox("#lineSelectBox","라인 선택",lineDate);
	}catch(error){
		console.error("error",error);
	}
};

window.onload = function() { 
	
	// 데이트 피커 생성
	const startDatePicker = datePiker('#tui-date-picker-container1','#startDate');
	const endDatePicker = datePiker('#tui-date-picker-container2','#endDate');

	// 데이트 피커 초기값 설정
	startDatePicker.setNull();
	endDatePicker.setNull();
	
	// 서버에서 받은 데이터로 select box 생성
	fetchProcessInfoList();
	fetchLineInfoList();
	
	// 그리드 생성
	createWorkInstructionGrid();
	createWorkerGrid();
	document.getElementById('tab-material-tab').addEventListener('click',createMaterialGrid);
};

// 그리드 초기값
let workInstructionGrid = "";
let workerGrid = "";
let materialGrid = "";
let regGrid = "";

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
			scrollX: true,
			scrollY: true,
			//width: 'auto',
			bodyHeight: 280,
			columns: [
				{header: '지시번호', name: 'wi_no', width:90, sortable: true},
				{header: '계획번호', name: 'plan_id', width:210, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '품목번호', name: 'product_no', width:90, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '품목', name: 'product_name', width:210, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '수량', name: 'vol', width:50},
				{header: '단위', name: 'unit_name', width:50},
				{header: '공정', name: 'process_name', width:80, filter : 'select'},
				{header: '라인', name: 'line_name', width:100, filter : 'select', editor: {
																	            	type: 'select',
																	            	options: {
																	              	listItems: [
																	                	{ text: 'Y', value: 'Y' },
																	                	{ text: 'N', value: 'N' }
																	              	]
													        				 }}},
				{header: '공정 상태', name: 'wi_status_name', width:90, filter : 'select'},
				{header: '검사 상태', name: 'qc_status_name', width:100, filter : 'select'},
				{header: '작업 시작일', name: 'start_date', width:120, sortable: true},
				{header: '작업 종료일', name: 'end_date', width:120, sortable: true},
				{header: '작업 담당자', name: 'emp_name', width:110, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }}
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
			
		});
		
		// 데이터 fetch
		fetchWorkInstruction();
		
		// id 및 rowType 숨기기
		//workInstructionGrid.hideColumn("no");
};

function createWorkerGrid(){
		
		// 작업자 초기값
		const data = workerList;
		
		var Grid = tui.Grid;
		Grid.applyTheme('clean');
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
			scrollX: true,
			scrollY: true,
			bodyHeight: 280,
			columns: [
				{header: '사원번호', name: 'no', sortable: true},
				{header: '사원명', name: 'name',	filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '부서', name: 'dept'},
				{header: '직급', name: 'position',	editor: {
													            type: 'select',
													            options: {
													              listItems: [
													                { text: 'Y', value: 'Y' },
													                { text: 'N', value: 'N' },
													              ]
									        				 }}, filter : 'select'},
				{header: '연락처', name: 'phone', filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '이메일', name: 'email'},
			],
			data: data,
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
			scrollX: true,
			scrollY: true,
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

document.getElementById('large').addEventListener('shown.bs.modal', () => {	
	var Grid = tui.Grid;
	
	if (regGrid) {
		// 이미 생성된 경우 destroy하지 않고 재사용
		regGrid.refreshLayout();
		return;
	}
	
	regGrid = new Grid({
		el: document.getElementById('regGrid'),
		rowHeaders: ['checkbox'],
		scrollX: true,
		scrollY: true,
		bodyHeight: 280,
		columns: [
			{header: '계획번호', name: 'PLAN_ID', filter: { type: 'text', showApplyBtn: true, showClearBtn: true },sortable: true},
			{header: '품목번호', name: 'PRODUCT_NO', filter: { type: 'text', showApplyBtn: true, showClearBtn: true },sortable: true},
			{header: '품목', name: 'PRODUCT_NAME', filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
			{header: '수량', name: 'SALE_VOL', sortable: true},
			{header: '생산 시작 예정일', name: 'PLAN_START_DATE', sortable: true},
			{header: '생산 완료 목표일', name: 'PLAN_END_DATE', sortable: true},
			{header: ' ', name: 'PLAN_PRIORITY', filter : 'select'}
		],
		data: [],
		columnOptions: {
		  resizable: true
		},
	});
	
	fetchRegWorkInstructionInfo();
});

/**
 * 생산계획의 작업정보 가져오기
 */
async function fetchRegWorkInstructionInfo(){
	try{
		const response = await fetch('/api/reg-work-instruction-info');
		if (!response.ok) {
           	throw new Error("네트워크 응답 실패");
       	}
		const result = await response.json();
		console.log("result",result);
		
		// 그리드 데이터 바인딩
		regGrid.resetData(result);
		
	}catch(error){
		console.log("error",error);
	}
};

/**
 * 생산계획의 작업정보를 작업 지시 테이블에 insert
 */
document.getElementById('insert-work-instruction').addEventListener('click', () =>{
	const checkedRows = regGrid.getCheckedRows();
	console.log("checkedRows",checkedRows);
	const data = checkedRows.map(row =>({
		PLAN_ID:row.PLAN_ID
	}));
	console.log("data",data);
	insertWorkInstruction('/api/insert-work-instruction',data);
});

async function insertWorkInstruction(url,data){
	try{
		const response = await fetch(url,{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": token
			},
			body: JSON.stringify(data)
		});
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		location.reload(true);
		
	}catch(error){
		console.log("error",error);
	}
};

/**
 * 작업 지시 정보 조회
 */
async function fetchWorkInstruction(){
	try{
		const response = await fetch("/api/work-instruction-info");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const workInstructionList = await response.json();
		console.log("workInstructionList",workInstructionList);
		
		workInstructionGrid.resetData(workInstructionList);
		
	}catch(error){
		console.log("error",error);
	}
};
/**
 * 클릭한 로우의 품목을 만드는데 필요한 자재 정보 조회
 */
workInstructionGrid.on('click',() => {
	fetchMaterialsByRowSelection();
});

async function fetchMaterialsByRowSelection(){
	try{
		const response = await fetch("/api//material-info-by-row-selection");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		//const result = await response.json();
	}catch(error){
		
	}
};


