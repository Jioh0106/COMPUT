const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

let processGrid = "";
let lineGrid = "";

// 페이지 로드 시 설비 정보 조회하는 함수 호출

//window.onload = async function () { //페이지 로드 시 사용내역 그리드 현시 처리
//	selectProcessInfo();
//	document.getElementById('tab-line-tab').addEventListener('click',selectLineInfo);
//};

document.addEventListener("DOMContentLoaded", function() {
    console.log("문서 로드 완료");

    // 공정 정보 로드
    selectProcessInfo();

    // 탭 클릭 시 라인 정보 조회
    document.getElementById('tab-line-tab').addEventListener('click', function() {
        selectLineInfo();
    });
});

// 공정정보
// 초기 화면 함수
function selectProcessInfo() {
		
	const data = processList;
	//console.log("processList:", data);
	var Grid = tui.Grid;
	
	if (processGrid) {
		// 이미 생성된 경우 destroy하지 않고 재사용
		processGrid.refreshLayout();
		return;
	}
	
	document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
		document.getElementById('tab-process').classList.add("active");
	
	processGrid = new Grid({
		el: document.getElementById('processGrid'),
		rowHeaders: ['checkbox'],
		bodyHeight: 280,
		columns: [
			{header: '공정번호', name: 'no', width: '100', sortable: true},
			{header: '공정명', name: 'name',	width: '210', editor: 'text'},
			{header: '공정우선순위', name: 'priority',	width: '120' ,editor: 'text', sortable: true},
			{header: '설명', name: 'description', editor: 'text'},
			{header: '사용여부', name: 'isActive',	 width : '90',editor: {
												            type: 'select',
												            options: {
												              listItems: [
												                { text: 'Y', value: 'Y' },
												                { text: 'N', value: 'N' },
												              ]
												            }}, filter : 'select'},
			{header: '생성일', name: 'cDate',	 width : '180'},
			{header: '수정일', name: 'udDate', width : '180'},
			{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
		],
		data: data,
		columnOptions: {
		  resizable: true
		}
	});
	
	// id 및 rowType 숨기기
	//processGrid.hideColumn("no");
	processGrid.hideColumn("rowType");
	
	// 추가 버튼 이벤트
	proAdd.addEventListener('click', () => {
		processGrid.appendRow({
			"no": "",
			"name": "",
			"priority": "",
			"isActive": "",
			"description": "",
			"cDate": "",
			"udDate": "",
			"rowType": "insert"
		},
			{
				at: 0, // 행 추가 인덱스
				focus: true
			});
	});
	
	// 저장 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	proSave.addEventListener('mousedown', () => {
		processGrid.blur(); // 포커스 해제

		// 수정된 행일 경우 rowType을 update로 변경
		const updatedRows = processGrid.getModifiedRows().updatedRows;
		updatedRows.forEach((row, index) => {
			processGrid.setValue(row.rowKey, "rowType", "update")
		});
	});
	
	// 체크박스가 활성화된 행의 index를 배열에 저장
	let delRows = [];
	processGrid.on('check', (ev) => {
		delRows.push(ev.rowKey);
	});
	
	// 삭제 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	proDel.addEventListener('mousedown', () => {
		processGrid.blur(); // 포커스 해제
		
		// delRows 저장된 인덱스에 대한 행 삭제 처리
		delRows.forEach((index) => {
			// 삭제된 행일 경우 rowType을 update로 변경
			processGrid.setValue(index, "rowType", "delete")
			processGrid.removeRow(index);
		});
	});
}; // selectInfo 함수 끝

// 검색 조건 입력 조회
function searchProcess(searchId){
	const value = document.getElementById(searchId).value;
	var data = {value: value};
	$.ajax({
		url: "/searchProcess",
		contentType: "application/json",
		data: JSON.stringify(data),
		type: 'POST',
		//추가해야 하는 부분
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		},
		success: function (response) {
			processGrid.resetData(response);
		} // success
	}) // ajax
}

// 추가 및 수정된 값이 저장된 json을 들고 통신
function saveProcessData() {
	const modifiedRows = processGrid.getModifiedRows(); // 수정된 데이터 가져오기

	const createdRows = modifiedRows.createdRows; // 추가된 행
	const updatedRows = modifiedRows.updatedRows; // 수정된 행
	const deletedRows = modifiedRows.deletedRows; // 수정된 행

	// 모든 수정된 데이터 배열로 합치기
	const modifiedData = [...createdRows, ...updatedRows, ...deletedRows];
	const data = [];

	modifiedData.forEach(row => {
		const rowData = {};

		// 각 행의 데이터를 꺼냄
		rowData.no = row.no;					// 고유번호
		rowData.name = row.name;				// 공정명
		rowData.priority = row.priority;	 	// 우선순위
		rowData.isActive = row.isActive;		// 사용여부
		rowData.description	= row.description;	// 설명
		rowData.cDate = row.cDate;				// 생성일
		rowData.udDate = row.udDate;			// 수정일
		rowData.rowType = row.rowType;			// 행 타입
	
		data.push(rowData);
	});

	// 수정된 데이터를 서버로 전송
	$.ajax({
		url: "/processSaveData", // 변경된 데이터를 처리할 컨트롤러 URL
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify(data),
		//추가해야 하는 부분
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		},
		success: function (res) {
			if (res == 1) {
				Swal.fire({
					title: "저장 성공",
					icon: "success",
					confirmButtonText: "확인"
				}).then(function () { // 확인 클릭 시 실행
					location.reload(true); // 페이지 새로고침
				});
			} else {
				Swal.fire({
					title: "저장 실패",
					icon: "error",
					confirmButtonText: "확인"
				});
			}
		},
		error: function () {
			Swal.fire({
				title: "서버 오류",
				icon: "error",
				confirmButtonText: "확인"
			});
		}
	});
}; // save 함수 끝

// 라인 정보
// 초기 화면 함수
function selectLineInfo() {
	
	const data = lineList;
	console.log("lineList:", data);  // 확인용
	var Grid = tui.Grid;
	
	document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
	document.getElementById('tab-line').classList.add("active");
	
	if (lineGrid) {
		// 이미 생성된 경우 destroy하지 않고 재사용
		lineGrid.refreshLayout();
		return;
	}
	
	lineGrid = new Grid({
		el: document.getElementById('lineGrid'),
		rowHeaders: ['checkbox'],
		bodyHeight: 280,
		columns: [
			{header: '라인번호', name: 'no', width: '100', sortable: true},
			{header: '라인명', name: 'name', width: '320', editor: 'text'},
			{header: '설명', name: 'description', editor: 'text'},
			{header: '사용여부', name: 'isActive', width: '90', editor: {
												            type: 'select',
												            options: {
												              listItems: [
												                { text: 'Y', value: 'Y' },
												                { text: 'N', value: 'N' },
												              ]
												            }}, filter : 'select'},
			{header: '생성일', name: 'cDate', width : '180'},
			{header: '수정일', name: 'udDate', width : '180'},
			{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
		],
		data: data,
		columnOptions: {
		  resizable: true
		}
	});
	
	// id 및 rowType 숨기기
	//lineGrid.hideColumn("no");
	lineGrid.hideColumn("rowType");
	
	// 추가 버튼 이벤트
	lineAdd.addEventListener('click', () => {
		lineGrid.appendRow({
			"no": "",
			"name": "",
			"isActive": "",
			"description": "",
			"cDate": "",
			"udDate": "",
			"rowType": "insert"
		},
			{
				at: 0, // 행 추가 인덱스
				focus: true
			});
	});
	
	// 저장 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	lineSave.addEventListener('mousedown', () => {
		lineGrid.blur(); // 포커스 해제

		// 수정된 행일 경우 rowType을 update로 변경
		const updatedRows = lineGrid.getModifiedRows().updatedRows;
		updatedRows.forEach((row, index) => {
			lineGrid.setValue(row.rowKey, "rowType", "update")
		});
	});
	
	// 체크박스가 활성화된 행의 index를 배열에 저장
	let delRows = [];
	lineGrid.on('check', (ev) => {
		delRows.push(ev.rowKey);
	});
	
	// 삭제 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	lineDel.addEventListener('mousedown', () => {
		lineGrid.blur(); // 포커스 해제
		
		// delRows 저장된 인덱스에 대한 행 삭제 처리
		delRows.forEach((index) => {
			// 삭제된 행일 경우 rowType을 update로 변경
			lineGrid.setValue(index, "rowType", "delete")
			lineGrid.removeRow(index);
		});
	});
}; // selectInfo 함수 끝

// 검색 조건 입력 조회
function searchLine(searchId){
	const value = document.getElementById(searchId).value;
	var data = {value: value};
	$.ajax({
		url: "/searchLine",
		contentType: "application/json",
		data: JSON.stringify(data),
		type: 'POST',
		//추가해야 하는 부분
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		},
		success: function (response) {
			lineGrid.resetData(response);
		} // success
	}) // ajax
}

// 추가 및 수정된 값이 저장된 json을 들고 통신
function saveLineData() {
	const modifiedRows = lineGrid.getModifiedRows(); // 수정된 데이터 가져오기

	const createdRows = modifiedRows.createdRows; // 추가된 행
	const updatedRows = modifiedRows.updatedRows; // 수정된 행
	const deletedRows = modifiedRows.deletedRows; // 수정된 행

	// 모든 수정된 데이터 배열로 합치기
	const modifiedData = [...createdRows, ...updatedRows, ...deletedRows];
	const data = [];

	modifiedData.forEach(row => {
		const rowData = {};

		// 각 행의 데이터를 꺼냄
		rowData.no = row.no;					// 고유번호
		rowData.name = row.name;				// 공정명
		rowData.isActive = row.isActive;		// 사용여부
		rowData.description	= row.description;	// 설명
		rowData.cDate = row.cDate;				// 생성일
		rowData.udDate = row.udDate;			// 수정일
		rowData.rowType = row.rowType;			// 행 타입
	
		data.push(rowData);
	});

	// 수정된 데이터를 서버로 전송
	$.ajax({
		url: "/lineSaveData", // 변경된 데이터를 처리할 컨트롤러 URL
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify(data),
		//추가해야 하는 부분
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		},
		success: function (res) {
			if (res == 1) {
				Swal.fire({
					title: "저장 성공",
					icon: "success",
					confirmButtonText: "확인"
				}).then(function () { // 확인 클릭 시 실행
					location.reload(true); // 페이지 새로고침
				});
			} else {
				Swal.fire({
					title: "저장 실패",
					icon: "error",
					confirmButtonText: "확인"
				});
			}
		},
		error: function () {
			Swal.fire({
				title: "서버 오류",
				icon: "error",
				confirmButtonText: "확인"
			});
		}
	});
}; // save 함수 끝
