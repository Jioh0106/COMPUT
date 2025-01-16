$(function() {

	// type으로 공통 코드 가져오는 함수
	function getCommonList(type) {
	    return axios.get(`/api/absence/common/list/${type}`)
	        .then(function (response) {
	            return response.data; // 데이터 반환
	        })
	        .catch(function (error) {
	            console.error('Error fetching data:', error);
				Swal.fire(
				        'Error',
				        '데이터를 가져오는 중 문제가 발생했습니다.',
				        'error'
				      )
	            return []; // 에러 발생 시 빈 배열 반환
	        });
	}


	// 부서 셀렉트 박스 
	$('#deptSelect').on('click', function () {
	    // 이미 데이터가 로드된 경우 추가 요청 방지
	    if (this.options.length > 1) {
	        return;
	    }

	    const type = 'DEPT'; 

	    getCommonList(type).then(function (data) {
	        $('#deptSelect')
	            .empty()
				.append('<option value="" disabled selected>선택하세요</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#deptSelect').append(
	                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
	                );
	            }
	        });
	    });
	    
	}); // 부서 셀렉트 박스

	// 근무형태 셀렉트 박스 (일반직/기술직/계약직) 
	$('#ocptSelect').on('click', function () {
	    // 이미 데이터가 로드된 경우 추가 요청 방지
	    if (this.options.length > 1) {
	        return;
	    }

	    const type = 'OCPT'; 

	    getCommonList(type).then(function (data) {
	        $('#ocptSelect')
	            .empty()
				.append('<option value="" disabled selected>선택하세요</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#ocptSelect').append(
	                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
	                );
	            }
	        });
	    });
	    
	}); // 근무형태 셀렉트 박스


	// ===============================================================================

	// 제이쿼리로 데이트피커에 숫자만 입력되게 정규식 처리
	function datePickerReplace(id) {
		$(document).ready(function () {
			// 숫자가 아닌 정규식
			var replaceNotInt = /[^0-9]/gi;

			$(`#${id}`).on("focusout", function () {
				var x = $(this).val();
				if (x.length > 0) {
					if (x.match(replaceNotInt)) {
						x = x.replace(replaceNotInt, "");
					}
					$(this).val(x);
				}
			}).on("keyup", function () {
				$(this).val($(this).val().replace(replaceNotInt, ""));
			});
		});
	}

	const currentDate = new Date();
	const nextMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);	
	const nextMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

	console.log("Next Month First Day:", nextMonthFirstDay.toLocaleDateString('en-CA'));
	console.log("Next Month Last Day:", nextMonthLastDay.toLocaleDateString('en-CA'));
	
	// 첫 번째 DatePicker 초기화
	const container1 = document.getElementById('tui-date-picker-container-1');
	const target1 = document.getElementById('tui-date-picker-target-1');
	const instance1 = new tui.DatePicker(container1, {
		date: nextMonthFirstDay,
		input: {
			element: target1,
			format: 'yyyy-MM-dd'
		}
	});
	instance1.setDate(nextMonthFirstDay); // 값 강제 설정

	// 두 번째 DatePicker 초기화
	const container2 = document.getElementById('tui-date-picker-container-2');
	const target2 = document.getElementById('tui-date-picker-target-2');
	const instance2 = new tui.DatePicker(container2, {
		date: nextMonthLastDay,
		input: {
			element: target2,
			format: 'yyyy-MM-dd'
		}
	});
	instance2.setDate(nextMonthLastDay); // 값 강제 설정
	
	// ===================================================================================

	let grid;

	grid = new tui.Grid({
		el: document.getElementById('emp-grid'),
		data: [], // 초기 데이터
	    rowHeaders: ['checkbox'], // 행 헤더: 체크박스 추가
	    columns: [
	        { header: '사번', name: 'EMP_ID' },
	        { header: '이름', name: 'EMP_NAME' },
	        { header: '부서', name: 'EMP_DEPT' },
	        { header: '직급', name: 'EMP_POSITION' },
	        { header: '근무형태', name: 'EMP_JOB_TYPE' }
	    ]
	});


	// 검색 항목 값들이 바뀔 때마다 사원 검색 결과 반영
	$('.serch-content').on('change', function() {
		let tmp = $('#work_tmp').val();
		let ocptSelect = $('#ocptSelect').val();
		let deptSelect = $('#deptSelect').val();
		let emp_info = $('#emp_info').val();

		console.log("tmp : " + tmp);
		console.log("ocptSelect : " + ocptSelect);
		console.log("deptSelect : " + deptSelect);
		console.log("emp_info : " + emp_info);
		
		const serchEmpInfo = {
			ocpt : ocptSelect,
			dept : deptSelect,
			emp_info : emp_info
		};
		
		axios.get('/api/work/serchEmp', {
			params: serchEmpInfo 
		})
	    .then(function (response) {
			const data = response.data; // 데이터 로드
			console.log('Fetched data:', data);
		    grid.resetData(data);
		    grid.refreshLayout(); // 레이아웃 새로고침
		})
		.catch(function (error) {
		    console.error('Error fetching data:', error);
		});
		
		
	});

	const csrfToken = $('input[name="_csrf"]').val();
	console.log("CSRF Token : " + csrfToken);

	$('#appendWork').on('click', function() {
		let tmp = $('#work_tmp').val();
		let start = instance1.getDate().toLocaleDateString('en-CA');  // 'yyyy-MM-dd' 형식
		let end = instance2.getDate().toLocaleDateString('en-CA');   // 'yyyy-MM-dd' 형식
		let weekdays = getWeekdaysBetweenDates(start, end);
		let selectedRows = grid.getCheckedRows();
		
	    
	    console.log("tmp : " +  tmp);
	    console.log("start : " +  start);
	    console.log("end : " +  end);
		for (const row of selectedRows) {
		    console.log('Row:', row);
		}
		for (const day of weekdays) {
		    console.log('Day:', day);
		}
		
	    // 선택된 항목이 없을 경우
		if (selectedRows.length === 0) {
	        Swal.fire('Warning', '직원을 선택해 주세요.', 'warning');
	        return;
	    } 
		
	    // 선택된 템플릿이 없을 경우
		if (tmp === null || tmp === '') {
	        Swal.fire('Warning', '템플릿을 선택해 주세요.', 'warning');
	        return;
	    } 
		
		const appendData = {
			rows : selectedRows,
			weekdays: weekdays, 
			tmp : tmp
		}
		
		// 겹치는 일정 확인
		ckeckWork(appendData)
		    .then(function (data) {
		        // 200 상태일 때 처리
		        let exist_emp = '';
		        data.forEach(work => {
		            if (work.emp_name && work.emp_id) {
		                exist_emp += ', ' + work.emp_id + '(' + work.emp_name + ')';
		            }
		        });
		        Swal.fire('Warning', exist_emp, 'warning');
		    })
		    .catch(function (error) {
		        if (error.status === 404) {
		            // 404 상태일 때 insertWork 호출
		            insertWork(appendData);
		        }
		    });
			
			
	});
	
	function ckeckWork(appendData) {
		console.log("ckeckWork()");
		
		return axios.post('/api/work/check', appendData,  {
		    headers: {
		        'X-CSRF-TOKEN': csrfToken
		    }
		})
		.then(function (response) {
			if (response.status === 200) {
			    Swal.fire('Warning', '지정일에 일정이 이미 등록된 직원이 있습니다. ', 'warning');
			    return response.data; // 데이터 반환
		    }
		})
		.catch(function (error) {
		    console.error("Error in ckeckWork:", error.response || error);
		    if (error.response) {
		        const status = error.response.status;
		        if (status === 404) {
		            console.log("Rejecting with 404 status");
		            return Promise.reject({ status, appendData });
		        }
		    }
		    return Promise.reject(error); // 다른 에러 상태 처리
		});
		
		
	}
	
	function insertWork(appendData) {
		console.log("insertWork()");
		
		return 	axios.post('/api/work/insert', appendData,  {
		    headers: {
		        'X-CSRF-TOKEN': csrfToken
		    }
		})
		.then(function (response) {
		    Swal.fire('Success', '데이터가 성공적으로 저장되었습니다.', 'success');
		    window.close();
		    // 부모 창 새로고침
		    if (window.opener && !window.opener.closed) {
		        window.opener.location.reload();
		    }
		})
		.catch(function (error) {
		    console.error('데이터 저장 중 오류 발생:', error);
		    Swal.fire('Error', '데이터 저장 중 문제가 발생했습니다.', 'error');
		});	
	
			
			
	}
		
	
	
	// startDate와 endDate 사이의 모든 날짜 중 주말 제외한 날짜 추출
	function getWeekdaysBetweenDates(start, end) {
	    const result = [];
	    let currentDate = new Date(start);
	    const finalDate = new Date(end);

	    // 날짜 범위 순회
	    while (currentDate <= finalDate) {
	        const dayOfWeek = currentDate.getDay(); // 0: Sunday, 6: Saturday
	        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
	            // 주말이 아닌 경우 배열에 추가
	            result.push(new Date(currentDate).toISOString().split('T')[0]); // yyyy-MM-dd 형식
	        }
	        currentDate.setDate(currentDate.getDate() + 1); // 하루 증가
	    }

	    return result;
	}
	
	
	

});
