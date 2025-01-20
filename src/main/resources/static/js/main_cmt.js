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
				atndBtn = data.result;
				console.info(atndBtn);

				const btn = document.getElementById("atndBtn");

				if (atndBtn == "start") {
					btn.disabled = false;
					btn.textContent = "출근하기"; // 버튼 텍스트 변경
				}
				else if (atndBtn == "startDs") {
					btn.disabled = true; //비활성화
					btn.textContent = "출근하기"; // 버튼 텍스트 변경
				}
				else if (atndBtn == "end") {
					btn.disabled = false;
					btn.textContent = "퇴근하기"; // 버튼 텍스트 변경
				}
				else {
					btn.disabled = true;
					btn.textContent = "퇴근하기"; // 버튼 텍스트 변경
				}
			})
	};

	// 출/퇴근 버튼 처리
	function cmtBtn() {
		console.info(header);
		fetch(
			"/insertCmt",
			{
				method: "POST"
				, headers: {
					'header': header,
					"Content-Type": "application/json",
					'X-CSRF-Token': token
				}
				/*, body: JSON.stringify({
					btnType: id
				})*/

			})
			.then(response => {
				console.info(response);
				Swal.fire({
					title: "출근 완료",
					icon: "success",
					confirmButtonText: "확인"
				}).then(function() { // 확인 클릭 시 실행
					atndBtn = "end";
					window.location.href = '/cmt-stts'; // 출퇴근 현황 페이지로 이동
				});

			})
	};
});