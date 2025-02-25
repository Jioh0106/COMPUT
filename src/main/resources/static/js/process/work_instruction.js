// spring security token
const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

let processSelectBox = null;
let lineSelectBox = null;

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
	const dataWithNullValue = [
        { label: placeholderText, value: '' }, // 기본값 항목
        ...fetchData // 기존 fetchData 항목들
    ];
	return new tui.SelectBox(idSelector,{
		placeholder: placeholderText,
		data:dataWithNullValue
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
		
		const processData = processInfoList.map(item => ({
			label:item.processName,
			value:item.processNo
		}));
		
		// selectBox 생성
		processSelectBox = selectBox("#processSelectBox","공정 선택",processData);
		
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
		lineSelectBox = selectBox("#lineSelectBox","라인 선택",lineData);
		
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
	await fetchProcessInfoList();
	const gridLineListItems = await fetchLineInfoList();
	
	// 초기 그리드 생성
	createWorkInstructionGrid(gridLineListItems);
	
	createMaterialGrid();
	document.getElementById('tab-worker-tab').addEventListener('click',createWorkerGrid);
	
	document.getElementById('planNoSearch').addEventListener('input', search);
	startDatePicker.on('change',search);
	endDatePicker.on('change',search);
  	processSelectBox.on('change', search);
	
  	if (lineSelectBox) {
      	lineSelectBox.on('change', search);
  	}
	
};

// 그리드 초기값
let workInstructionGrid = "";
let workerGrid = "";
let materialGrid = "";
let regGrid = "";

function search() {
    const selectedProcess = processSelectBox?.getSelectedItem();
    const selectedLine = lineSelectBox?.getSelectedItem();

    const workInstructionFilter = {
        planNo: document.getElementById('planNoSearch').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
		processNo: selectedProcess && selectedProcess.value ? selectedProcess.value : "",  
        lineNo: selectedLine && selectedLine.value ? selectedLine.value : ""
    };

    fetchWorkInstruction(workInstructionFilter);
}

function createWorkInstructionGrid(gridLineListItems = []){
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
																		        const selectedItem = gridLineListItems.find(item => item.value == value);
																		        return selectedItem ? selectedItem.text : value;  // 존재하면 text(공정 1라인), 없으면 기본값
																		    }},
				{header: '공정', name: 'process_name', width:210, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '공정 상태', name: 'wi_status', width:90, filter : 'select'},
				{header: '공정 상태', name: 'wi_status_name', width:90, filter : 'select'},
				{header: '검사 상태', name: 'qc_status_name', width:100, filter : 'select'},
				{header: '작업 시작일', name: 'start_date', width:120, sortable: true},
				{header: '작업 종료일', name: 'end_date', width:120, sortable: true},
				{header: '작업 담당자', name: 'emp_name', width:110, filter: { type: 'text', showApplyBtn: true, showClearBtn: true }},
				{header: '작업 아이디', name: 'emp_id',width:110}
			],
			data: [],
			columnOptions: {
			  resizable: true
			},
			
		});
		
		workInstructionGrid.hideColumn("emp_id");
		workInstructionGrid.hideColumn("wi_status");
		workInstructionGrid.hideColumn("qc_status_name");
		
		// 데이터 fetch
		fetchWorkInstruction(null);
		
		workInstructionGrid.on('check',() => {
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
async function fetchWorkInstruction(workInstructionFilter){
	try{
		const params = new URLSearchParams(workInstructionFilter).toString();
		const response = await fetch(`/api/work-instruction-info?${params}`);
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
	       console.warn("작업지시 항목을 선택해주세요.");
		   Swal.fire({
				title:"작업지시 항목을 선택해주세요.",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
		   });
	       return;
	}
	
	if (checkedMaterialRows.length === 0) {
	       console.warn("자재 항목을 선택해주세요.");
		   Swal.fire({
				title:"자재 항목을 선택해주세요.",
   				icon:"info",
   				confirmButtonColor: "#435ebe",
   				confirmButtonText: "확인"
   		   });
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
	
	Swal.fire({
		title:"자재 투입 요청 완료",
		icon:"success",
		confirmButtonColor: "#435ebe",
		confirmButtonText: "확인"
   	});
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
        console.warn("작업 담당자를 선택하세요.");
		Swal.fire({
			title:"작업 담당자를 선택하세요.",
			icon:"info",
			confirmButtonColor: "#435ebe",
			confirmButtonText: "확인"
	   	});
        return;
    }
    
    if (checkedWiGrid.length === 0) {
        console.warn("담당할 작업지시를 선택하세요.");
		Swal.fire({
			title:"담당할 작업지시를 선택하세요.",
			icon:"info",
			confirmButtonColor: "#435ebe",
			confirmButtonText: "확인"
	   	});
        return;
    }

    const selectedWorker = checkedWorkerGrid[0]; // 첫 번째 체크된 작업자
    const selectedWorkerNo = selectedWorker.no;
    const selectedWorkerName = selectedWorker.name;

    checkedWiGrid.forEach(row => {
        // UI에서 직접 셀 업데이트
        workInstructionGrid.setValue(row.rowKey, 'emp_id', selectedWorkerNo);
        workInstructionGrid.setValue(row.rowKey, 'emp_name', selectedWorkerName);
    });

	console.log("작업 담당자 추가 완료");
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
        workInstructionGrid.setValue(row.rowKey, 'emp_id', '');
    });

    console.log("작업 담당자 삭제 완료");
});

// 작업시작 버튼 동작
document.getElementById('workStartBtn').addEventListener('click', async () => {
	const checkedWiGrid = workInstructionGrid.getCheckedRows();
	console.log("checkedWiGrid",checkedWiGrid);
	
	if (checkedWiGrid.length === 0) {
		console.warn("작업지시 항목이 선택되지 않았습니다.");
   		Swal.fire({
			title:"작업지시 항목을 선택해주세요.",
	   		icon:"info",
	   		confirmButtonColor: "#435ebe",
	   		confirmButtonText: "확인"
	   	});
       return;
	}
	
	// 상태에 따른 유효성 검사
	// 공정 상태가 '대기중(PRGR005)' 일때만 동작
    for (let row of checkedWiGrid) {
        const status = workInstructionGrid.getValue(row.rowKey, 'wi_status');
        if (status === 'PRGR002') {
			Swal.fire({
				title:"생산중입니다.",
	   			icon:"info",
		   		confirmButtonColor: "#435ebe",
		   		confirmButtonText: "확인"
		   	});
            return;
        } else if (status === 'PRGR003') {
			Swal.fire({
				title:'완료된 지시사항입니다.',
	   			icon:'info',
		   		confirmButtonColor: "#435ebe",
		   		confirmButtonText: "확인"
		   	});
            return;
        } else if (status === 'PRGR006') {
			Swal.fire({
				title:"종료된 지시사항입니다.",
	   			icon:"info",
		   		confirmButtonColor: "#435ebe",
		   		confirmButtonText: "확인"
		   	});
            return;
        }
    }
	
	// 라인 선택 유효성 검사
	for (let row of checkedWiGrid) {
		// 'line_name' 값이 null, undefined, 또는 빈 문자열("")인 경우 경고 메시지 출력
       	const lineName = workInstructionGrid.getValue(row.rowKey, 'line_name');
        console.log("lineName : ",lineName);
       	if (!lineName) {
           	console.warn("라인을 선택해주세요");
			Swal.fire({
				title:"라인을 선택해주세요.",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
			});
           	return;
       	}
   	}
	console.log('라인 선택완료!');
	
	// 담당자 추가 유효성 검사
	for (let row of checkedWiGrid) {
       	// 'line_name' 값이 null, undefined, 또는 빈 문자열("")인 경우 경고 메시지 출력
       	const empId = workInstructionGrid.getValue(row.rowKey, 'emp_id');
        console.log("empId : ",empId);
       	if (!empId) {
           	console.warn("담당자을 선택해주세요");
			Swal.fire({
				title:"담당자을 선택해주세요",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
			});
           	return;
       	}
   	}
	console.log('담당자 선택완료!');
	
	// 출고 대기 항목 갯수
	const itemsNumber = await workStart('/api/count-outbound-items-by-wiNo',checkedWiGrid);
	console.log('출고 대기 항목 갯수',itemsNumber);
	
	// 출고 대기 항목 갯수가 0이 아니면 작업시작 동작 제어
	if(itemsNumber > 0){
		Swal.fire({
			title:"자재 출고 대기 중입니다.",
			icon:"warning",
			confirmButtonColor: "#435ebe",
			confirmButtonText: "확인"
		});
		return;
	}
	
   	// 각 작업지시 데이터에 firstWiNo 추가
   	const updateWiData = checkedWiGrid.map(row => ({
	       ...row,
		   line_name: workInstructionGrid.getValue(row.rowKey, 'line_name')
   	}));
	
	console.log("updateData ",updateWiData);
	
	await workStart('/api/start-work-instruction',updateWiData);
	
	location.reload(true);
	
});

async function workStart(url,data){
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
		
		const result = await response.json();
		console.log('result',result);
		return result;
		
	}catch(error){
		console.log("error",error);
	}
};


// 공정완료 버튼 동작
document.getElementById('processFinishBtn').addEventListener('click', async () => {
	try{
		const selectRows = workInstructionGrid.getCheckedRows();
		console.log("공정완료 동작을 위한 로우 정보",selectRows);
		
		if (selectRows.length === 0) {
      		console.warn("완료할 작업 지시를 선택해주세요");
			Swal.fire({
				title:"완료할 작업 지시를 선택해주세요.",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
			});
       		return;
		}
		
		// 상태에 따른 유효성 검사
		// 공정 상태가 '생산중' 일때만 동작
		for (let row of selectRows) {
			const status = workInstructionGrid.getValue(row.rowKey, 'wi_status');
			if (status === 'PRGR005') {
				Swal.fire({
					title:"공정 대기중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR003') {
				Swal.fire({
					title:"완료된 지시사항입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR006') {
				Swal.fire({
					title:"종료된 지시사항입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			}
		}
		
		const response = await fetch("/api/complete-process",{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": token
			},
			body: JSON.stringify(selectRows)
		});
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		
		location.reload(true);
				
		console.log("공정 완료!");
	}catch(error){
		console.log("error",error);
	}
	
});

// 품질검사 버튼 동작
document.getElementById('defectCheckBtn').addEventListener('click', async () =>{
	try{
		console.log("품질 검사 버튼");
		const selectRows = workInstructionGrid.getCheckedRows();
		console.log("품질 검사 동작을 위한 로우 정보",selectRows);
		
		if (selectRows.length === 0) {
      		console.warn("품질 검사할 항목을 선택해주세요");
			Swal.fire({
				title:"품질 검사할 항목을 선택해주세요.",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
			});
       		return;
		}
		
		// 상태에 따른 유효성 검사
		// 공정 상태가 '완료' 일때만 동작
		for (let row of selectRows) {
			const status = workInstructionGrid.getValue(row.rowKey, 'wi_status');
			const qcStatus = workInstructionGrid.getValue(row.rowKey, 'qc_status');
			if (status === 'PRGR005') {
				Swal.fire({
					title:"공정 대기중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR002') {
				Swal.fire({
					title:"생산중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR006') {
				Swal.fire({
					title:"종료된 지시사항입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			}else if(qcStatus === 'LTST003'){
				Swal.fire({
					title:"품질 검사중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			}
		}
		
		const response = await fetch("/api/check-defect",{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": token
			},
			body: JSON.stringify(selectRows)
		});
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		
		Swal.fire({
			title:"품질 검사 시작",
			icon:"success",
			confirmButtonColor: "#435ebe",
			confirmButtonText: "확인"
		});
		
		location.reload(true);
		
	}catch(error){
		console.log("error",error);
	}
});


// 작업 종료 버튼 동작
document.getElementById('workEndBtn').addEventListener('click', async () => {
	try{
		const selectRows = workInstructionGrid.getCheckedRows();
		console.log("작업종료 동작을 위한 로우 정보",selectRows);
		
		if (selectRows.length === 0) {
      		console.warn("종료할 작업 지시를 선택해주세요");
			Swal.fire({
				title:"종료할 작업 지시를 선택해주세요.",
				icon:"info",
				confirmButtonColor: "#435ebe",
				confirmButtonText: "확인"
			});
       		return;
		}
		
		// 상태에 따른 유효성 검사
		// 공정 상태가 '완료' 일때만 동작
		for (let row of selectRows) {
			const status = workInstructionGrid.getValue(row.rowKey, 'wi_status');
			if (status === 'PRGR005') {
				Swal.fire({
					title:"공정 대기중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR002') {
				Swal.fire({
					title:"생산중입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			} else if (status === 'PRGR006') {
				Swal.fire({
					title:"종료된 지시사항입니다.",
					icon:"info",
					confirmButtonColor: "#435ebe",
					confirmButtonText: "확인"
				});
				return;
			}
		}
		
		const response = await fetch("/api/end-work-instruction",{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": token
			},
			body: JSON.stringify(selectRows)
		});
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		
		location.reload(true);
		
		console.log("작업 종료!");
	}catch(error){
		console.log("error",error);
	}
	
});

