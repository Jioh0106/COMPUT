// ajax fetch API - 공통상세코드 조회
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

// 페이지가 완전히 로드된 후 함수 실행
window.onload = function () {
       fetchCommonDetails();
   };

// 다음 주소 api
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

const empHireDatePiker = datePiker('#emp-hire-date-wrapper','#emp_hire_date');
const empExitDatePiker = datePiker('#emp-exit-date-wrapper','#emp_exit_date');
empExitDatePiker.setNull();

//------------- 유효성 검사 -----------------------------------------------------------------------------------------------

import {allowKoAndEn,allowOnlyNumbers} from "./inputValidator.js";

const regBtn = document.querySelector("#regBtn");
const nameInput = document.getElementById("emp_name");
const ssnInput1 = document.getElementById("first_emp_ssn");
const ssnInput2 = document.getElementById("second_emp_ssn");
const phoneInput1 = document.getElementById("firstEmpPhoneNo");
const phoneInput2 = document.getElementById("middleEmpPhoneNo");
const phoneInput3 = document.getElementById("lastEmpPhoneNo");
const postCodeInput = document.getElementById("postCode");
const addressInput = document.getElementById("emp_address");
const salaryInput = document.getElementById("emp_salary");
const bankInput = document.getElementById("emp_bank"); // 은행명
const accountInput = document.getElementById("emp_account"); // 계좌번호

function validateInputs() {
  let isValid = true;
  let errorMessage = "";

  // 이름 유효성 검사 (한글, 영어만 허용, 공백 가능, null 불가능)
  if (!nameInput.value || !allowKoAndEn(nameInput.value)) {
    errorMessage += "이름은 한글과 영어만 입력 가능하며, 공백은 허용되나 값이 비어있을 수는 없습니다.\n";
    isValid = false;
  }

  // 주민등록번호 앞자리, 뒷자리 유효성 검사 (숫자만 허용, 공백 불가능, null 불가능)
  if (!allowOnlyNumbers(ssnInput1.value) || !ssnInput1.value) {
    errorMessage += "주민등록번호 앞자리는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  if (!allowOnlyNumbers(ssnInput2.value) || !ssnInput2.value) {
    errorMessage += "주민등록번호 뒷자리는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  // 전화번호 입력 유효성 검사 (숫자만 허용, 공백 불가능, null 불가능)
  if (!allowOnlyNumbers(phoneInput1.value) || !phoneInput1.value) {
    errorMessage += "전화번호 앞자리는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  if (!allowOnlyNumbers(phoneInput2.value) || !phoneInput2.value) {
    errorMessage += "전화번호 중간자리는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  if (!allowOnlyNumbers(phoneInput3.value) || !phoneInput3.value) {
    errorMessage += "전화번호 끝자리는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  // 우편번호 유효성 검사 (숫자만 허용, 공백 불가능, null 불가능)
  if (!allowOnlyNumbers(postCodeInput.value) || !postCodeInput.value) {
    errorMessage += "우편번호는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  // 주소 유효성 검사 (null 불가능)
  if (!addressInput.value) {
    errorMessage += "주소는 비워둘 수 없습니다.\n";
    isValid = false;
  }

  // 급여 입력 유효성 검사 (숫자만 허용, 공백 불가능, null 불가능)
  if (!allowOnlyNumbers(salaryInput.value) || !salaryInput.value) {
    errorMessage += "급여는 숫자만 입력 가능하며, 공백이 없어야 합니다.\n";
    isValid = false;
  }

  // 은행명 유효성 검사 (한글, 영어만 허용, 공백 가능, null 가능)
  if (bankInput.value && !allowKoAndEn(bankInput.value)) {
    errorMessage += "은행명은 한글과 영어만 입력 가능합니다.\n";
    isValid = false;
  }

  // 계좌번호 유효성 검사 (숫자만 허용, 공백 가능, null 가능)
  if (accountInput.value && !allowOnlyNumbers(accountInput.value)) {
    errorMessage += "계좌번호는 숫자만 입력 가능합니다.\n";
    isValid = false;
  }

  if (!isValid) {
    alert(errorMessage);
  }

  return isValid;
}

// 등록 버튼 클릭 이벤트
regBtn.addEventListener("click", (event) => {
  if (!validateInputs()) {
    event.preventDefault(); // 유효성 검사 실패 시 폼 전송 중단
  }
});
 
