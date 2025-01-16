$(document).ready(function () {
    // 오늘 날짜를 yyyy-MM-dd 형식으로 포맷
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1 필요)
        const day = String(date.getDate()).padStart(2, '0'); // 날짜를 두 자리로
        return `${year}-${month}-${day}`;
    }

    // 오늘 날짜 가져오기 및 todayDate에 출력
    const today = new Date();
    const formattedToday = formatDate(today);
    $('#todayDate').text(formattedToday); // 오늘 날짜 출력

    // Toast UI Calendar 초기화
    const calendar = new tui.Calendar('#calendar', {
        defaultView: 'month', // 기본 뷰 설정 (월 단위)
        taskView: false, // Task 보이지 않게 설정
        scheduleView: true, // 일정 보이게 설정
        useDetailPopup: true, // 상세 팝업 활성화
        template: {
            monthDayname: (dayname) =>
                `<span class="calendar-week-dayname">${dayname.label}</span>`, // 주 이름 템플릿
        },
    });

    // 현재 뷰의 월 업데이트 함수
    function updateCurrentMonth() {
        const currentDate = calendar.getDate(); // 현재 뷰의 날짜 가져오기
        const year = currentDate.getFullYear(); // 연도
        const month = currentDate.getMonth() + 1; // 월
        $('#today').text(`${year}년 ${month}월`); // 현재 월 출력
    }

    // Today 버튼 클릭: 현재 날짜로 이동
    $('#todayBtn').on('click', function () {
        calendar.today(); // 현재 날짜로 이동
        updateCurrentMonth(); // 현재 월 업데이트
    });

    // Next 버튼 클릭: 다음 월로 이동
    $('#nextBtn').on('click', function () {
        calendar.next(); // 다음 월로 이동
        updateCurrentMonth(); // 현재 월 업데이트
    });

    // Prev 버튼 클릭: 이전 월로 이동
    $('#prevBtn').on('click', function () {
        calendar.prev(); // 이전 월로 이동
        updateCurrentMonth(); // 현재 월 업데이트
    });

    // 페이지 로드 시 현재 월 표시
    updateCurrentMonth();
});
