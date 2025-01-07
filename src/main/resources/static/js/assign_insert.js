// ajax fetch API
async function fetchCommonDetails() {
	try{
	  	const response = await fetch("http://localhost:8082/api/assignCommonDetail");
		if(!response.ok){
			throw new Error("Network response was not ok");
		}
		const cdCodeData = await response.json();
		console.log(cdCodeData);
		
		//DEPT(부서),PSTN(직급),APNT(발령구분)
		const typeSelect = document.getElementById('assign_type'); //발령구분
		const posSelect = document.getElementById('new_pos'); //발령직급
		const deptSelect = document.getElementById('new_dept'); //발령부서
	
		
		cdCodeData.forEach(item => {
			const option = document.createElement('option');
			option.value = item.common_detail_code;
			option.textContent = item.common_detail_name;
			
			if(item.common_detail_code.startsWith('APNT')){
				typeSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('PSTN')){
				posSelect.appendChild(option);
			}else if(item.common_detail_code.startsWith('DEPT')){
				deptSelect.appendChild(option);
			}
		});
		
	}catch(error){
		console.error();
	}
}

// 페이지가 완전히 로드된 후 함수 실행
window.onload = function () {
       fetchCommonDetails();
   };