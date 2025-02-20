	const header = document.querySelector('meta[name="_csrf_header"]').content;
	const token = document.querySelector('meta[name="_csrf"]').content;
	
	document.addEventListener("DOMContentLoaded", function () {
	    checkRequests();
	});
	
	// 로그인한 사번의 발령 승인 여부 확인 (백엔드 API 호출)
	function checkRequests() {
	    fetch(`/api/request/select/checked`)
	        .then(response => response.json())
	        .then(data => {
	            if (data.length > 0) { // 승인된 발령이 있을 경우
	                showToast(data);
	            }
	        })
	        .catch(error => console.error("API 요청 오류:", error));
	}
	
	//  토스트 알림 표시 함수
	function showToast(data) {
		console.log("showToast에 전달된 데이터:", data);
	   
		 var toastElement = document.querySelector('.toast');
	    var toast = new bootstrap.Toast(toastElement);
	    toast.show();
	//  X 버튼 클릭 시, 토스트 닫기 및 상태 업데이트 (이미 업데이트된 상태이므로 추가 API 호출 불필요)
	 document.querySelector('.btn-close').addEventListener('click', function () {
	        data.forEach(request => {
				console.log('request뭐야 :', request);
	            updateChecked(request.request_no);
	        });
	    });
	}
	
	
	// X 버튼 클릭 시, is_checked를 'Y'로 업데이트하는 API 호출
	function updateChecked(request_no) {
	    fetch(`/api/request/update/checked?request_no=${request_no}`, {
	        method: "POST",
			headers: {
	           "Content-Type": "application/json",
	           [header]: token  
	       },
			
	    }).then(response => {
	        if (response.ok) {
	            console.log("is_checked 업데이트 완료: ", request_no);
	        }
	    }).catch(error => console.error("API 요청 오류:", error));
	}
	
	
	
	
