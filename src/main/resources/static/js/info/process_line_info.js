const header = document.querySelector('meta[name="_csrf_header"]').content;
const token = document.querySelector('meta[name="_csrf"]').content;

let grid = "";

// 페이지 로드 시 설비 정보 조회하는 함수 호출
window.onload = function () { //페이지 로드 시 사용내역 그리드 현시 처리
	selectInfo();
};

// 초기 화면 함수
function selectInfo() {
	
	const data = /*[[${processLineList}]]*/[];
	
	var Grid = tui.Grid;

	if (grid) {
		// 이미 생성된 경우 destroy하지 않고 재사용
		grid.refreshLayout();
		return;
	}
	
	grid = new Grid({
		el: document.getElementById('processGrid'),
		rowHeaders: ['checkbox'],
		columns: [
			{header: '고유번호',	name: 'no'},
			{header: '일련번호',	name: 'sn',		editor: 'text', sortable: true},
			{header: '설비명',		name: 'name',	editor: 'text', sortable: true},
			{header: '종류',		name: 'kind',	editor: {
												            type: 'select',
												            options: {
												              listItems: [
												                { text: '절단', value: '절단' },
												                { text: '절삭', value: '절삭' },
												                { text: '조립', value: '조립' }
												              ]
												            }}, 	sortable: true},
			{header: '제조사',		name: 'mnfct',	editor: 'text', sortable: true},
			{header: '구입일',		name: 'buy',    editor: {
											                type: 'datePicker',
											                options: {
											                    format: 'yyyy-MM-dd',
															language: 'ko'
											                }}, 	sortable: true},
			{header: '설치일',		name: 'set',    editor: {
											                type: 'datePicker',
											                options: {
											                    format: 'yyyy-MM-dd',
															language: 'ko'
											                }}, 	sortable: true},
			{header: '사용여부',	name: 'useYn',	editor: {
												            type: 'select',
												            options: {
												              listItems: [
												                { text: 'Y', value: 'Y' },
												                { text: 'N', value: 'N' },
												              ]
												            }}, 	sortable: true},
			{header: '타입', name: 'rowType'} // 조회 / 추가를 구분하기 위함
		],
		data: data,
		columnOptions: {
		  resizable: true
		}
	});
	
	// id 및 rowType 숨기기
	grid.hideColumn("no");
	grid.hideColumn("rowType");
	
	// 추가 버튼 이벤트
	add.addEventListener('click', () => {
		grid.appendRow({
			"no": "",
			"sn": "",
			"name": "",
			"kind": "",
			"mnfct": "",
			"buy": "",
			"set": "",
			"useYn": "",
			"rowType": "insert"
		},
			{
				at: 0, // 행 추가 인덱스
				focus: true
			});
	});
	
	// 저장 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	save.addEventListener('mousedown', () => {
		grid.blur(); // 포커스 해제

		// 수정된 행일 경우 rowType을 update로 변경
		const updatedRows = grid.getModifiedRows().updatedRows;
		updatedRows.forEach((row, index) => {
			grid.setValue(row.rowKey, "rowType", "update")
		});
	});
	
	// 체크박스가 활성화된 행의 index를 배열에 저장
	let delRows = [];
	grid.on('check', (ev) => {
		delRows.push(ev.rowKey);
	});
	
	// 삭제 버튼 이벤트
	// 마지막 셀에 대한 값이 인식 안 돼서 저장 버튼에 마우스다운 이벤트 처리
	del.addEventListener('mousedown', () => {
		grid.blur(); // 포커스 해제
		
		// delRows 저장된 인덱스에 대한 행 삭제 처리
		delRows.forEach((index) => {
			// 삭제된 행일 경우 rowType을 update로 변경
			grid.setValue(index, "rowType", "delete")
			grid.removeRow(index);
		});
	});
}; // selectInfo 함수 끝

// 검색 조건 입력 조회
function searchSelect(searchId){
	const value = document.getElementById(searchId).value;
	var data = {value: value};
	$.ajax({
		url: "/eqpSearchSelect",
		contentType: "application/json",
		data: JSON.stringify(data),
		type: 'POST',
		//추가해야 하는 부분
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		},
		success: function (response) {
			grid.resetData(response);
		} // success
	}) // ajax
}

// 추가 및 수정된 값이 저장된 json을 들고 통신
function saveData() {
	const modifiedRows = grid.getModifiedRows(); // 수정된 데이터 가져오기

	const createdRows = modifiedRows.createdRows; // 추가된 행
	const updatedRows = modifiedRows.updatedRows; // 수정된 행
	const deletedRows = modifiedRows.deletedRows; // 수정된 행

	// 모든 수정된 데이터 배열로 합치기
	const modifiedData = [...createdRows, ...updatedRows, ...deletedRows];
	const data = [];

	modifiedData.forEach(row => {
		const rowData = {};

		// 각 행의 데이터를 꺼냄
		//if(row.no != null && row.no != 'null' && row.no != '' && row.no != 'undefind'){
			rowData.no	= row.no;		// 고유번호
		//}
		rowData.sn		= row.sn;		// 일련번호
		rowData.name	= row.name;		// 설비명
		rowData.kind	= row.kind;	 	// 종류
		rowData.mnfct	= row.mnfct;	// 제조사
		rowData.buy		= row.buy;		// 구입일
		rowData.set		= row.set;		// 설치일
		rowData.useYn	= row.useYn;	// 사용여부
		rowData.rowType = row.rowType;	// 행 타입

		data.push(rowData);
	});

	// 수정된 데이터를 서버로 전송
	$.ajax({
		url: "/eqpSaveData", // 변경된 데이터를 처리할 컨트롤러 URL
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