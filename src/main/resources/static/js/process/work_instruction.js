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
		
		const lineData = lineInfoList.map(item =>({
			label: item.lineName,
			value: item.lineNo
		}));
		
		// 그리드에서 사용할 listItems 생성
		const gridLineListItems = lineData.map(item => ({
			text: item.label,
			value: item.value
		}));
		
		console.log("라인정보 확인",gridLineListItems);
		
		// selectBox 생성
		//selectBox("#lineSelectBox","라인 선택",lineData);
		
		// 그리드 생성할 때 동적으로 listItems 적용
		createWorkInstructionGrid(gridLineListItems);
	}catch(error){
		console.error("error",error);
	}
};

window.onload = async function() { 
	
	// 데이트 피커 생성
	const startDatePicker = datePiker('#tui-date-picker-container1','#startDate');
	const endDatePicker = datePiker('#tui-date-picker-container2','#endDate');

	// 데이트 피커 초기값 설정
	startDatePicker.setNull();
	endDatePicker.setNull();
	
	// 서버에서 받은 데이터로 select box 생성
	//fetchProcessInfoList();
	//fetchLineInfoList();
	const gridLineListItems = await fetchLineInfoList();
	console.log("gridLineListItems",gridLineListItems);
	
	// 그리드 생성
	createWorkInstructionGrid(gridLineListItems);
	//createMaterialGrid();
	createWorkerGrid();
	//document.getElementById('tab-worker-tab').addEventListener('click',createWorkerGrid);
	document.getElementById('tab-material-tab').addEventListener('click',createMaterialGrid);
};

// 그리드 초기값
let workInstructionGrid = "";
let workerGrid = "";
let materialGrid = "";
let regGrid = "";

function createWorkInstructionGrid(gridLineListItems = []){
		//const data = [];//processList;
		//console.log("processList:", data);
		var Grid = tui.Grid;
		Grid.applyTheme('clean');
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
				{header: '라인', name: 'line_name', width:100, filter : 'select', editor: {
																	            	type: 'select',
																	            	options: {
																	              	listItems: gridLineListItems 
													        				 }},
																		 	formatter: ({ value }) => {
																				//console.log("라인 매칭 값 (원본):", value); 
																		        const selectedItem = gridLineListItems.find(item => item.value == value);
																				//console.log("라인 매칭 값:", value, selectedItem);
																		        return selectedItem ? selectedItem.text : value;  // 존재하면 text(공정 1라인), 없으면 기본값
																		    }},
				{header: '공정', name: 'process_name', width:210, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '공정 상태', name: 'wi_status_name', width:90, filter : 'select'},
				{header: '검사 상태', name: 'qc_status_name', width:100, filter : 'select'},
				{header: '작업 시작일', name: 'start_date', width:120, sortable: true},
				{header: '작업 종료일', name: 'end_date', width:120, sortable: true},
				{header: '작업 담당자', name: 'emp_name', width:110, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }}
				//{header: '작업 아이디', name: 'emp_id',width:110}
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
			
		});
		
		//workInstructionGrid.hideColumn("emp_id");
		
		// 데이터 fetch
		fetchWorkInstruction();
		
		workInstructionGrid.on('click',() => {
			fetchMaterialsByRowSelection();
		});
		
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
				{header: '재고번호', name: 'invenNO', sortable: true},
				{header: '자재번호', name: 'mtlNo', sortable: true},
				{header: '자재명', name: 'mtlName', sortable: true},
				{header: '창고', name: 'warehouse', sortable: true},
				{header: '구역', name: 'zone', sortable: true},
				{header: '출고수량', name: 'calculatedQty', sortable: true},
				{header: '단위', name: 'unitName', sortable: true}
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
		});
		
		materialGrid.hideColumn("invenNO");
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
async function fetchMaterialsByRowSelection(){
	try{
		// 1️.체크된 행 가져오기 (한 개만 선택)
      	const checkedRows = workInstructionGrid.getCheckedRows();
		console.log("checkedRows",checkedRows);
      	if (checkedRows.length === 0) {
	          console.warn("선택된 품목이 없습니다.");
	          return;
      	}
	
      	// 단일 품목번호, 수량 가져오기
      	const productNo = checkedRows[0].product_no; 
      	const vol = checkedRows[0].vol; 
	
  		console.log("선택된 품목번호:", productNo);
  		console.log("선택된 수량:", vol);
	
      	const response = await fetch(`/api/material-info-by-row-selection?productNo=${productNo}&vol=${vol}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		
		// 3️. 서버에서 받은 데이터 materialGrid에 적용
        const materialList = await response.json();
        console.log("조회된 BOM 정보:", materialList);

        materialGrid.resetData(materialList);
	}catch(error){
		console.error("BOM 정보 조회 실패:", error);
	}
};

/**
 * 자재 투입 버튼 클릭시 재고 출고 대기에 insert
 */
document.getElementById('inputMaterial').addEventListener('click',() => {
	const checkedMaterialRows = materialGrid.getCheckedRows();
	const checkedWiRows = workInstructionGrid.getCheckedRows().map(row => row.wi_no);
	console.log("checkedMaterialRows",checkedMaterialRows);
	console.log("checkedWiRows",checkedWiRows);
	
	if (checkedWiRows.length === 0) {
	       console.warn("작업지시 항목이 선택되지 않았습니다.");
	       return;
	}
	
   	const fWiNo = checkedWiRows[0]; // 첫 번째 선택된 wi_no 가져오기
	
   	// 각 자재 데이터에 firstWiNo 추가
   	const insertMaterialData = checkedMaterialRows.map(row => ({
	       ...row,
	       wiNo: fWiNo
   	}));
	
	   console.log("updatedMaterialRows (wi_no 추가됨)", insertMaterialData);
	
	insertOB('/api/insert-material-warehouse',insertMaterialData);
});

async function insertOB(url,data){
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
		//location.reload(true);
		
	}catch(error){
		console.log("error",error);
	}
};

// 작업담당자 추가 버튼 이벤트
document.getElementById('addBtn').addEventListener('click', () => {
	const checkedWorkerGrid = workerGrid.getCheckedRows();
	    const checkedWiGrid = workInstructionGrid.getCheckedRows();
	    
	    if (checkedWorkerGrid.length === 0) {
	        console.warn("작업담당자를 선택하세요.");
	        return;
	    }
	    
	    if (checkedWiGrid.length === 0) {
	        console.warn("작업지시를 선택하세요.");
	        return;
	    }

	    const selectedWorker = checkedWorkerGrid[0]; // 첫 번째 체크된 작업자
	    const selectedWorkerName = selectedWorker.name;

	    checkedWiGrid.forEach(row => {
	        // UI에서 직접 셀 업데이트
	        workInstructionGrid.setValue(row.rowKey, 'emp_name', selectedWorkerName);
	    });

	    console.log("담당자 배정 완료:", selectedWorkerName);
});

// 작업담당자 삭제 버튼 이벤트
document.getElementById('deleteBtn').addEventListener('click', () => {
    const checkedWiGrid = workInstructionGrid.getCheckedRows();

    if (checkedWiGrid.length === 0) {
        console.warn("작업지시를 선택하세요.");
        return;
    }

    checkedWiGrid.forEach(row => {
        // 작업 담당자 정보 제거
        workInstructionGrid.setValue(row.rowKey, 'emp_name', '');
    });

    console.log("작업 담당자 삭제 완료");
});

// 작업시작 버튼 동작
document.getElementById('workStartBtn').addEventListener('click', async () => {
	const checkedWiGrid = workInstructionGrid.getModifiedRows().updatedRows;
	const checkedWorkerRows = workerGrid.getCheckedRows().map(item => item.no);
	console.log("추가할 사원아이디",checkedWorkerRows);
	
	if (checkedWiGrid.length === 0) {
	       console.warn("작업지시 항목이 선택되지 않았습니다.");
	       return;
	}
	
   	const fWiNo = checkedWorkerRows[0]; // 첫 번째 선택된 사원번호 가져오기
	
   	// 각 작업지시 데이터에 firstWiNo 추가
   	const updateWiData = checkedWiGrid.map(row => ({
	       ...row,
	       empId: fWiNo,
		   //line_name: workInstructionGrid.getValue(row.rowKey, 'line_name')
   	}));
	
	console.log("updateData ",updateWiData);
	
	workStartBtn('/api/start-work-instruction',updateWiData);
	
});

async function workStartBtn(url,data){
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
		//location.reload(true);
		
	}catch(error){
		console.log("error",error);
	}
};

// 공정완료 버튼 동작
document.getElementById('processFinishBtn').addEventListener('click', async () => {
	console.log("공정 완료 버튼");
	
	const response = await fetch('/api/work-instruction-info');
	const fetchWorkInstructionInfo = response.json();
	console.log("공정완료동작을위한 정보",fetchWorkInstructionInfo);
	
});
