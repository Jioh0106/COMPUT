const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

let workInstructionGrid = "";
let workerGrid = "";
let materialGrid = "";

window.onload = function() { 
	console.log("작업시지 js 연결");
	createWorkInstructionGrid();
	createWorkerGrid();
	createMaterialGrid();
};

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

		if (workerGrid) {
			// 이미 생성된 경우 destroy하지 않고 재사용
			workerGrid.refreshLayout();
			return;
		}
		
		let workerDiv = document.getElementById('tab-worker');
		workerDiv.classList.add('active');
		
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

		if (materialGrid) {
			// 이미 생성된 경우 destroy하지 않고 재사용
			materialGrid.refreshLayout();
			return;
		}
		
		let materialDiv = document.getElementById('tab-material');
		materialDiv.classList.add('active');
		
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
