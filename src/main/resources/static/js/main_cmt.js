$(document).ready(function() {
	console.info("js");
	const header = document.querySelector('meta[name="_csrf_header"]').content;
	const token = document.querySelector('meta[name="_csrf"]').content;

	let atndBtn;

	// 출/퇴근 확인 조회 함수
	selectCmt();

	function selectCmt() {
		fetch(
			"/mainCmt",

			{
				method: "POST"
				, headers: {
					'header': header,
					"Content-Type": "application/json",
					'X-CSRF-Token': token
				}
				, body: JSON.stringify({
					btnType: "cmtBtn"
				})

			})
			.then(resp => resp.json()) // 응답 객체를 매개변수로 얻어와 파싱
			.then(data => {
				
				$("#cmtCd").val(data.cmtCd);
				$("#deptCd").val(data.empDept);
				$("#sttsCd").val(data.sttsCd);
				$("#empNo").val(data.empNo);
				$("#empId").val(data.empId);
				
				atndBtn = data.result;

				const btn = document.getElementById("atndBtn");
				
				if (atndBtn == "start") {
					$("#cmtTime").val(data.cmtStart);
					btn.disabled = false;
					btn.textContent = "출근하기"; // 버튼 텍스트 변경
				}
				else if (atndBtn == "startDs") {
					btn.disabled = true; //비활성화
					btn.textContent = "출근하기";
				}
				else if (atndBtn == "end") {
					$("#cmtTime").val(data.cmtEnd);
					btn.disabled = false;
					btn.textContent = "퇴근하기"; // 버튼 텍스트 변경
				}
				else {
					btn.disabled = true;
					btn.textContent = "퇴근하기";
				}
			})
	};

	// 출/퇴근 버튼 처리
	$("#atndBtn").click(function () {
		
		var title;
		
		if(document.getElementById("atndBtn").innerText == "출근하기"){
			title = "출근 완료";
		} else {
			title = "퇴근 완료";
		}
		
		const data = {
			  cmtCd : document.getElementById('cmtCd').value
			, empDept : document.getElementById('deptCd').value
			, sttsCd : document.getElementById('sttsCd').value
			, empNo : document.getElementById('empNo').value
			, empId : document.getElementById('empId').value
			, cmtTime : document.getElementById('cmtTime').value
		}
		
		console.info(data);
		
		fetch(
			"/insertCmt",
			{
				method: "POST"
				, headers: {
					'header': header,
					"Content-Type": "application/json",
					'X-CSRF-Token': token
				}
				, body: JSON.stringify(data)

			})
			.then(response => {

				Swal.fire({
					title: title,
					icon: "success",
					confirmButtonText: "확인"
				}).then(function() { // 확인 클릭 시 실행
					atndBtn = "end";
					window.location.href = '/cmt-stts'; // 출퇴근 현황 페이지로 이동
				});

			})
	});
});