// datePikers
const startDatePicker = datePiker('#tui-date-picker-container1','#startDate');
const endDatePicker = datePiker('#tui-date-picker-container2','#endDate');
const empHireDatePicker = datePiker('#emp-hire-date-wrapper','#emp_hire_date');
const empExitDatePicker = datePiker('#emp-exit-date-wrapper','#emp_exit_date');

startDatePicker.setNull();
endDatePicker.setNull();

// toast ui 그리드
const Grid = tui.Grid;
Grid.applyTheme('clean'); // 그리드 테마

const empListGrid = new Grid({
  el: document.getElementById('grid'),
  data: [], // 초기 데이터
  rowHeaders: ['checkbox'],
  //scrollX: false,
  //scrollY: false,
  bodyHeight: 470,
  columns: [
    { 
		header: '입사일', 
		name: 'EMP_HIRE_DATE',
	},
    { 
		header: '사원번호', 
		name: 'EMP_ID',
	},
    { 
		header: '성명', 
		name: 'EMP_NAME',
	},
    { 
		header: '부서명', 
		name: 'EMP_DEPT_NAME',
		filter : 'select'
	},
    { 
		header: '직급명', 
		name: 'EMP_POSITION_NAME',
		filter : 'select'
	},
    { 
		header: '재직상태', 
		name: 'EMP_STATUS_NAME',
		filter : 'select'
	}
  ],
  columnOptions: {
          resizable: true
        }
});

const empListFilters = {
	startDate : '1900-01-01',
	endDate : '2999-12-31',
	search : '',
}

function updateEmpListFilters() {
	    empListFilters.startDate = document.getElementById('startDate').value || '1900-01-01';  
	    empListFilters.endDate = document.getElementById('endDate').value || '2999-12-31';      
	    empListFilters.search = document.getElementById('search').value || '';
	    
	    fetchEmpList();
	}

// 페이지가 완전히 로드된 후 함수 실행
window.onload = function () {
		
		fetchEmpList();
		fetchCommonDetails();
		
		startDatePicker.on('change', updateEmpListFilters);
		endDatePicker.on('change', updateEmpListFilters);
	   	document.getElementById('search').addEventListener('input', updateEmpListFilters);
		
	}

// 그리드에서 로우 클릭 이벤트 추가
empListGrid.on('click', function (ev) {
	
	const target = ev.nativeEvent.target;
	//console.log(target);
	const columnName = ev.columnName;
	
	if(target.type === 'checkbox' || columnName === '_checked'){
		return;
	}
    const rowKey = ev.rowKey; // 클릭된 로우의 인덱스
   	const clickedRowData = empListGrid.getData()[rowKey];  // 해당 로우 데이터 가져오기
	
	console.log(clickedRowData);

    // 모달에 데이터 설정
    showModal(clickedRowData);
});

// 조회된 정보 모달에 바인딩
function showModal(empDetailInfo) {
	
    //const modalBody = document.querySelector('#empDatailModal .modal-body');
	//modalBody.innerHTML = ``;
	
	// 수정시 hidden 넘길 데이터
	const empId = document.getElementById('emp_id');
	const empPw = document.getElementById('emp_pw');
	const empNo = document.getElementById('emp_no');
	const empRegDate = document.getElementById('emp_reg_date');
	//const empModDate = document.getElementById('emp_mod_date');
	
	const empRole = document.getElementById('emp_role');
	const empName = document.getElementById('emp_name');
	const empFirstSsn = document.getElementById('first_emp_ssn'); //EMP_SSN
	const empSecondSsn = document.getElementById('second_emp_ssn'); //EMP_SSN
	const empGender = document.getElementById('emp_gender');
	const empMaritalStatus = document.getElementById('emp_marital_status');
	const empFirstPhone = document.getElementById('firstEmpPhoneNo'); //EMP_PHONE
	const empMiddlePhone = document.getElementById('middleEmpPhoneNo'); //EMP_PHONE
	const empLastPhone = document.getElementById('lastEmpPhoneNo'); //EMP_PHONE
	const empEmail = document.getElementById('emp_email');
	const postCode= document.getElementById('postCode');
	const empAddress = document.getElementById('emp_address');
	const empAddressDetail = document.getElementById('emp_address_detail');
	const empEdu = document.getElementById('emp_edu');
	const empStatus = document.getElementById('emp_status');
	const empJobType = document.getElementById('emp_job_type');
	const empDept = document.getElementById('emp_dept');
	const empPosition = document.getElementById('emp_position');
	const empHireDate = document.getElementById('emp_hire_date');
	const empPerfRank = document.getElementById('emp_perf_rank');
	const empExitDate = document.getElementById('emp_exit_date');
	const empExitType = document.getElementById('emp_exit_type');
	const empSalary = document.getElementById('emp_salary');
	const empBank = document.getElementById('emp_bank');
	const empAccount = document.getElementById('emp_account');
	
	// 주민등록번호 문자열 분리
	let splitSsn = empDetailInfo.EMP_SSN.split('-');
	
	// 전화번호 문자열 분리
	let splitPhoneNum = empDetailInfo.EMP_PHONE.split('-');
	
	empId.value = empDetailInfo.EMP_ID;
	empPw.value = empDetailInfo.EMP_PW;
	empNo.value = empDetailInfo.EMP_NO;
	empRegDate.value = empDetailInfo.EMP_REG_DATE;
	//console.log(typeof(empRegDate.value));
	//empModDate.value = empDetailInfo.EMP_MOD_DATE || null;
	empRole.value = empDetailInfo.EMP_ROLE;
	empName.value = empDetailInfo.EMP_NAME;
	//empPhone.value = empDetailInfo.EMP_SSN;
	empFirstSsn.value = splitSsn[0];
	empSecondSsn.value = splitSsn[1];
	empGender.value = empDetailInfo.EMP_GENDER;
	empMaritalStatus.value = empDetailInfo.EMP_MARITAL_STATUS;
	//empPhone.value = empDetailInfo.EMP_PHONE;
	empFirstPhone.value = splitPhoneNum[0];
	empMiddlePhone.value = splitPhoneNum[1];
	empLastPhone.value = splitPhoneNum[2];
	empEmail.value = empDetailInfo.EMP_EMAIL;
	postCode.value = empDetailInfo.EMP_POSTCODE;
	empAddress.value = empDetailInfo.EMP_ADDRESS;
	empAddressDetail.value = empDetailInfo.EMP_ADDRESS_DETAIL;
	empEdu.value = empDetailInfo.EMP_EDU;
	empStatus.value = empDetailInfo.EMP_STATUS;
	empJobType.value = empDetailInfo.EMP_JOB_TYPE;
	empDept.value = empDetailInfo.EMP_DEPT;
	empPosition.value = empDetailInfo.EMP_POSITION;
	empHireDate.value = empDetailInfo.EMP_HIRE_DATE;
	empPerfRank.value = empDetailInfo.EMP_PERF_RANK;
	empExitDate.value = empDetailInfo.EMP_EXIT_DATE || "";
	empExitType.value = empDetailInfo.EMP_EXIT_TYPE;
	empSalary.value = empDetailInfo.EMP_SALARY;
	empBank.value = empDetailInfo.EMP_BANK;
	empAccount.value = empDetailInfo.EMP_ACCOUNT;

    // 모달을 표시
    const modal = new bootstrap.Modal(document.getElementById('empDatailModal'));
    modal.show();
}

// 삭제 버튼
const deleteBtn = document.getElementById('deleteBtn');
// 그리드에서 삭제하고싶은 key 배열로 만들어주기
function CheckedRowValues(gridObj,jsonKey){
	const checkedRowsIds = gridObj.getCheckedRows();
	//function(row){
	//	return row.EMP_ID
	//}
	const rowValues = checkedRowsIds.map(row => row[jsonKey]);
	return rowValues;
}
deleteBtn.addEventListener("click",() => {
	
	const checkedRowIds = CheckedRowValues(empListGrid,"EMP_ID");
	console.log(checkedRowIds);
		if(checkedRowIds.length === 0){
			alert("삭제할 정보를 선택해주세요");
		}else{
			if(confirm("삭제하시겠습니까?")){
				empDelete("http://localhost:8082/restApi/empDelete",checkedRowIds);
				alert("삭제 완료");
			}else{
				alert("삭제 취소");
			}
		}
	}
);

//--------ajax--------------------------------------------------------------------------------------------------------------------//

// 사원리스트 필터 조회
async function fetchEmpList() {
	try	{	
			const params = new URLSearchParams(empListFilters).toString();
	       	const response = await fetch(`http://localhost:8082/restApi/empList?${params}`);
			
	       	if (!response.ok) {
	           	throw new Error("네트워크 응답 실패");
	       	}
	       	const empList = await response.json();
	       	console.log(empList);

	       	// 그리드 데이터 갱신
	       	empListGrid.resetData(empList);
			
	   	} catch (error) {
	       	console.error("사원조회 중 오류:", error);
	   	}
}

// 필요한 공통 코드 상세 조회	
async function fetchCommonDetails() {
	try{
	  	const response = await fetch("http://localhost:8082/restApi/commonDetail");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const cdCodeData = await response.json();
		console.log(cdCodeData);
		
		// ATHR(권한),WRST(재직상태),DEPT(부서),PSTN(직급),OCPT(직종),RANK(평가등급),RTRM(퇴사유형)
		const athrSelect = document.getElementById('emp_role');
		const wrstSelect = document.getElementById('emp_status');
		const deptSelect = document.getElementById('emp_dept');
		const pstnSelect = document.getElementById('emp_position');
		const ocptSelect = document.getElementById('emp_job_type');
		const rankSelect = document.getElementById('emp_perf_rank');
		const rtrmSelect = document.getElementById('emp_exit_type');
		
		// console.log('공통코드'+athrSelect);
		
		cdCodeData.forEach(item => {
			const option = document.createElement('option');
			option.value = item.common_detail_code;
			option.textContent = item.common_detail_name;
			
			if(item.common_detail_code.startsWith('ATHR')){
				athrSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('WRST')){
				wrstSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('DEPT')){
				deptSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('PSTN')){
				pstnSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('OCPT')){
				ocptSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('RANK')){
				rankSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('RTRM')){
				rtrmSelect.appendChild(option);
			}
		});
		
	}catch(error){
		console.error("공통코드 조회 중 오류:", error);
	}
}

// 선택 삭제
async function empDelete(url,rowIds){
	console.log(rowIds);
	
	try{
		const response = await fetch(url,{
			method: "POST",
			headers:{
				"Content-Type":"application/json",
			},
			body:JSON.stringify(rowIds)
		})
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.text();
		console.log("result : "+result);
		setTimeout(()=>{
			window.location.reload();
		},500);
	}catch(error){
		console.error("삭제 실패",error);
	}
}

//----------------------------------------------------------------------------------------------------------------------------//

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

// 다음 주소 api
document.querySelector("#daumAPI").addEventListener("click", daumAddressAPI);
function daumAddressAPI() {
       new daum.Postcode({
           oncomplete: function(data) {
               // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

               // 각 주소의 노출 규칙에 따라 주소를 조합한다.
               // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
               var addr = ''; // 주소 변수
               var extraAddr = ''; // 참고항목 변수

               //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
               if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                   addr = data.roadAddress;
               } else { // 사용자가 지번 주소를 선택했을 경우(J)
                   addr = data.jibunAddress;
               }

               // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
               if(data.userSelectedType === 'R'){
                   // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                   // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                   if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                       extraAddr += data.bname;
                   }
                   // 건물명이 있고, 공동주택일 경우 추가한다.
                   if(data.buildingName !== '' && data.apartment === 'Y'){
                       extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                   }
                   // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                   if(extraAddr !== ''){
                       extraAddr = ' (' + extraAddr + ')';
                   }
                   // 조합된 참고항목을 해당 필드에 넣는다.
                   document.getElementById("emp_address").value = extraAddr;
               
               } else {
                   document.getElementById("emp_address").value = '';
               }

               // 우편번호와 주소 정보를 해당 필드에 넣는다.
               document.getElementById('postCode').value = data.zonecode;
               document.getElementById("emp_address").value = addr;
               // 커서를 상세주소 필드로 이동한다.
               document.getElementById("emp_address_detail").focus();
           }
       }).open();
}

// 팝업 창 띄우기
function popUp() {
    const width = 730;
    const height = 750;

    // 현재 창의 중앙 좌표 계산
    const left = (window.innerWidth - width) / 2 + window.screenLeft;
    const top = (window.innerHeight - height) / 2 + window.screenTop; 

    // 팝업 창 열기
    window.open('/ps-reg', 'popup', `width=${width}, height=${height}, left=${left}, top=${top}`);
}

