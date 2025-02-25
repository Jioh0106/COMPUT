$(document).ready(function () {
	
	// 오늘 날짜를 "yyyy-MM-dd" 형식으로 포맷
	function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1 필요)
        const day = String(date.getDate()).padStart(2, '0'); // 날짜를 두 자리로
        return `${year}-${month}-${day}`;
    }


    // 현재 뷰의 월 업데이트 함수
    function updateCurrentMonth() {
        const currentDate = calendar.getDate(); // 현재 뷰의 날짜 가져오기
        const year = currentDate.getFullYear(); // 연도
        const month = currentDate.getMonth() + 1; // 월
        $('#today').text(`${year}년 ${month}월`); // 현재 월 출력
    }
	
	// 현재 뷰 월의 첫날과 마지막 날 계산
	function getMonthStartAndEndDates() {
	    const currentDate = calendar.getDate(); // 현재 뷰의 날짜 가져오기
	    const year = currentDate.getFullYear();
	    const month = currentDate.getMonth(); // 월 (0부터 시작)
	    const firstDay = new Date(year, month, 1); // 첫째 날
	    const lastDay = new Date(year, month + 1, 0); // 마지막 날
	    return {
	        start: formatDate(firstDay),
	        end: formatDate(lastDay),
	    };
	}
	


	// Toast UI Calendar 초기화
	const calendar = new tui.Calendar('#calendar', {
	    defaultView: 'month', // 기본 뷰 설정 (월 단위)
	    taskView: false, // Task 보이지 않게 설정
	    scheduleView: true, // 일정 보이게 설정
	    useDetailPopup: true, // 상세 팝업 활성화
		timezone: {
	       zones: [
	           { timezoneName: 'Asia/Seoul', displayLabel: 'Seoul'},
	       ],
	   },
	    template: {
	        monthDayname: (dayname) =>
	            `<span class="calendar-week-dayname">${dayname.label}</span>`, // 주 이름 템플릿
	    },
	});

	// AJAX 요청 함수: 일정 가져오기
	function fetchSchedules() {
	    const { start, end } = getMonthStartAndEndDates();
	    console.log("start = " + start);
	    console.log("end = " + end);

	    $.ajax({
	        url: '/api/work/schedules', 
	        method: 'GET',
	        data: {
	            startDate: start,
	            endDate: end,
	        },
	        success: function (response) {
	            console.log('Schedules fetched successfully:', response);

	            // 기존 일정 삭제 후 새로운 일정 추가
	            calendar.clear(); 
	            const events = response.map(schedule => ({
	                id: schedule.id,
	                calendarId: schedule.calendarId, 
	                title: schedule.title, 
	                start: schedule.start, 
	                end: schedule.end, 
	                isAllDay: schedule.isAllDay || false,
	                category: schedule.category || 'time', 
	                location: schedule.location || '', 
	            }));
	            calendar.createEvents(events); // 새 일정 추가
	        },
	        error: function (xhr, status, error) {
	            console.error('Failed to fetch schedules:', error);
	        },
	    });
	}

	


    // Today 버튼 클릭: 현재 날짜로 이동
    $('#todayBtn').on('click', function () {
        calendar.today(); // 현재 날짜로 이동
        updateCurrentMonth(); // 현재 월 업데이트
		fetchSchedules(); // 일정 가져오기
    });

    // Next 버튼 클릭: 다음 월로 이동
    $('#nextBtn').on('click', function () {
        calendar.next(); // 다음 월로 이동
        updateCurrentMonth(); // 현재 월 업데이트
		fetchSchedules(); // 일정 가져오기
    });

    // Prev 버튼 클릭: 이전 월로 이동
    $('#prevBtn').on('click', function () {
        calendar.prev(); // 이전 월로 이동
        updateCurrentMonth(); // 현재 월 업데이트
		fetchSchedules(); // 일정 가져오기
    });

    // 페이지 로드 시 현재 월 표시
    updateCurrentMonth();
	// 페이지 로드 시 일정 가져오기
	fetchSchedules();
	
	
	
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
				.append('<option value="" disabled selected>전체 부서</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#deptSelect').append(
	                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
	                );
	            }
	        });
	    });
	    
	}); // 부서 셀렉트 박스
	
	

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
	
	$('#deptSelect').on('change', function () {
	    // 이미 데이터가 로드된 경우 추가 요청 방지
	    if (this.options.length > 1) {
	        return;
	    }
	
	    const type = 'DEPT'; 
	
	    getCommonList(type).then(function (data) {
	        $('#deptSelect')
	            .empty()
				.append('<option value="" disabled selected>전체 부서</option>');
	        data.forEach(item => {
	            if (item.common_detail_code && item.common_detail_name) {
	                $('#deptSelect').append(
	                    $('<option></option>').val(item.common_detail_code).text(item.common_detail_name)
	                );
	            }
	        });
	    });
	    
	}); // 부서 셀렉트 박스
	


});
