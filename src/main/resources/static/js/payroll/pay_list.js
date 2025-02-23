// 전역 변수 선언 - 그리드 인스턴스 관리용
let mainGrid = null;          // 메인 급여 대장 그리드
let annualGrid = null;        // 연간 급여 현황 그리드
let departmentGrids = {};     // 부서별 급여 현황 그리드
let currentModal = null;      // 현재 활성화된 모달 인스턴스

//DOM이 로드된 후 초기화를 수행하는 메인 함수
$(document).ready(() => {
    setupCSRF();
    initializeGrids();
    bindEvents();
    initializeYearSelect();
});


//CSRF 보안 설정
//Ajax 요청에 CSRF 토큰을 자동으로 포함시킴
function setupCSRF() {
    const token = $("meta[name='_csrf']").attr("content");
    const header = $("meta[name='_csrf_header']").attr("content");
    
    $.ajaxSetup({
        beforeSend: xhr => xhr.setRequestHeader(header, token)
    });
}


//모든 그리드의 초기화를 관리하는 통합 함수
function initializeGrids() {
    initializeMainGrid();
    initializeAnnualGrid();
}

//이벤트 리스너 통합 설정 함수
//검색, 연도 선택, 탭 전환, 모달 관련 이벤트를 처리
function bindEvents() {
   // 검색 버튼 클릭 이벤트
   $('.btn-primary.rounded-pill').on('click', e => {
       e.preventDefault();
       search();
   });
   
   // 검색어 입력 엔터 이벤트
   $('#basicInput').on('keypress', e => {
       if (e.which === 13) {
           e.preventDefault();
           search();
       }
   });
   
   // 연도 선택 변경 이벤트
   $('#yearSelect').on('change', function() {
       const selectedYear = $(this).val();
       if (selectedYear) {
           loadAnnualData(selectedYear);
       }
   });

   // 탭 전환 전에 모달 처리
   $('#payrollTabs a[data-bs-toggle="tab"]').on('hide.bs.tab', () => {
       if (currentModal) {
           currentModal.hide();
           currentModal.dispose();
           currentModal = null;
           document.body.classList.remove('modal-open');
           const backdrops = document.querySelectorAll('.modal-backdrop');
           backdrops.forEach(backdrop => backdrop.remove());
       }
   });

   // 탭 전환 후 그리드 처리
   $('#payrollTabs a[data-bs-toggle="tab"]').on('shown.bs.tab', e => {
       if (e.target.id === 'annual-tab' && annualGrid) {
           annualGrid.refreshLayout();
           const selectedYear = $('#yearSelect').val();
           if (selectedYear) {
               loadAnnualData(selectedYear);
           }
       }
   });

   // 모달 표시 이벤트 - 부서별 그리드 새로고침
   $('#payrollDetailModal').on('shown.bs.modal', () => {
       Object.values(departmentGrids).forEach(grid => grid?.refreshLayout());
   });
   
   // 모달 숨김 이벤트 - 모달 인스턴스 정리
   $('#payrollDetailModal').on('hidden.bs.modal', () => {
       if (currentModal) {
           currentModal.dispose();
           currentModal = null;
           document.body.classList.remove('modal-open');
           const backdrops = document.querySelectorAll('.modal-backdrop');
           backdrops.forEach(backdrop => backdrop.remove());
       }
   });
}

//숫자 포맷팅을 위한 Intl.NumberFormat 인스턴스
//천 단위 구분자 적용
const numberFormatter = new Intl.NumberFormat('ko-KR');

//숫자를 포맷팅하는 유틸리티 함수
//@param {number} num - 포맷팅할 숫자
//@returns {string} 포맷팅된 문자열
function formatNumber(num) {
    return num ? numberFormatter.format(num) : '0';
}

//연도 선택 드롭다운 초기화
//현재 연도부터 2년 전까지의 옵션을 생성
function initializeYearSelect() {
    const yearSelect = $('#yearSelect');
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;

    const years = Array.from(
        {length: currentYear - startYear + 1}, 
        (_, i) => currentYear - i
    );
    
    const options = years.map(year => 
        `<option value="${year}">${year}년</option>`
    );
    
    yearSelect.html('<option value="">연도 선택</option>' + options.join(''));
    yearSelect.val('');
}

//API 호출을 위한 통합 함수
//@param {string} endpoint - API 엔드포인트
//@param {Object} params - 요청 파라미터
//@returns {Promise} API 응답 Promise
async function fetchAPI(endpoint, params = {}) {
    try {
        return await $.ajax({
            url: endpoint,
            type: 'GET',
            data: params
        });
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

//메인 그리드 초기화 함수
//월별 급여 대장을 표시하는 그리드 생성
function initializeMainGrid() {
    mainGrid = new tui.Grid({
        el: document.getElementById('mainGrid'),
        data: [],
        rowHeaders: [],
        bodyHeight: 550,
        columns: [
            {
                header: '지급월',
                name: 'paymentDate',
                align: 'center',
            },
            {
                header: '대장명칭',
                name: 'payrollName',
                align: 'center',
            },
            {
                header: '인원수',
                name: 'headcount',
                align: 'center',
                formatter: ({value}) => `${formatNumber(value || 0)}명`
            },
            {
                header: '급여대장',
                name: 'payrollDetail',
                align: 'center',
                formatter: () => '<span class="clickable">조회</span>'
            },
            {
                header: '지급총액',
                name: 'totalAmount',
                align: 'right',
                formatter: ({value}) => `${formatNumber(value || 0)}원`
            }
        ]
    });

	// 조회 버튼 클릭 이벤트
	mainGrid.on('click', (ev) => {
	    if (ev.columnName === 'payrollDetail') {
	        const rowData = mainGrid.getRow(ev.rowKey);
	        loadDetailGrid(rowData.paymentDate);
	        
	        // 기존 모달 정리
	        if (currentModal) {
	            currentModal.dispose();
	        }
	        
	        const modalElement = document.getElementById('payrollDetailModal');
	        currentModal = new bootstrap.Modal(modalElement);
	        currentModal.show();
	    }
	});

    // 초기 데이터 로드
    loadMainGrid();
}

//메인 그리드 데이터 로드 함수
//@param {string} keyword - 검색 키워드
async function loadMainGrid(keyword = '') {
    try {
        const data = await fetchAPI('/api/payroll/pay-list/summary',{keyword});
        const formattedData = data.map(item => ({
            paymentDate: item.paymentDate,
            payrollName: item.payrollName,
            headcount: parseInt(item.headcount) || 0,
            payrollDetail: 'view',
            totalAmount: parseInt(item.totalAmount) || 0
        }));
        
        mainGrid.resetData(formattedData);
        mainGrid.refreshLayout();
    } catch (error) {
        alert('데이터 로드 중 오류가 발생했습니다.');
    }
}

//연간 급여 그리드 초기화 함수
function initializeAnnualGrid() {
    annualGrid = new tui.Grid({
        el: document.getElementById('annualGrid'),
        data: [],
        scrollX: true,
        scrollY: true,
        bodyHeight: 550,
        header: {
            height: 50
        },
        columnOptions: {
            frozenCount: 1
        },
        columns: getAnnualGridColumns()
    });
}

//연간 급여 그리드 컬럼 정의
//@returns {Array} 컬럼 설정 객체 배열
function getAnnualGridColumns() {
    const categoryColumn = {
        header: '구분',
        name: 'category',
        width: 120,
        align: 'center',
        formatter: ({row}) => CATEGORY_NAMES[row.category] || row.category
    };

    const monthColumns = Array.from({length: 12}, (_, i) => ({
        header: `${i + 1}월분`,
        name: `month${i + 1}`,
        width: 120,
        align: 'right',
        formatter: ({value}) => formatNumber(value)
    }));

    const totalColumn = {
        header: '합계',
        name: 'total',
        width: 150,
        align: 'right',
        formatter: ({value}) => formatNumber(value)
    };

    return [categoryColumn, ...monthColumns, totalColumn];
}

//급여 항목 카테고리 이름 매핑
const CATEGORY_NAMES = {
    empSalary: '기본급',
    techAllowance: '기술수당',
    tenureAllowance: '근속수당',
    performanceBonus: '성과급',
    holidayAllowance: '명절수당',
    leaveAllowance: '휴가수당',
    allowAmt: '수당총액',
    nationalPension: '국민연금',
    longtermCareInsurance: '장기요양보험',
    healthInsurance: '건강보험',
    employmentInsurance: '고용보험',
    incomeTax: '소득세',
    residentTax: '주민세',
    deducAmt: '공제총액',
    netSalary: '실수령액'
};

//연간 급여 데이터 로드 함수
//@param {number} year - 조회할 연도
async function loadAnnualData(year) {
        const data = await fetchAPI(`/api/payroll/pay-list/annual/${year}`,{year});
        if (!data) {
            annualGrid.resetData([]);
            return;
        }

        const gridData = processAnnualData(data);
        annualGrid.resetData(gridData);
        //시간 지연을 통해 안정적인 렌더링 보장(50ms)
        setTimeout(() => annualGrid.refreshLayout(), 50);
}

//연간 급여 데이터 처리 함수
//@param {Array} data - 서버에서 받은 원본 데이터
//@returns {Array} 그리드에 표시할 가공된 데이터
function processAnnualData(data) {
    const categories = Object.keys(CATEGORY_NAMES);
    const gridData = categories.map(category => {
        const row = { category };
        for (let i = 1; i <= 12; i++) {
            row[`month${i}`] = 0;
        }
        row.total = 0;
        return row;
    });

    data.forEach(monthData => {
        if (!monthData.paymentDate) return;
        
        const month = parseInt(monthData.paymentDate.split('-')[1], 10);
        if (isNaN(month) || month < 1 || month > 12) return;

        gridData.forEach(row => {
            const value = parseFloat(monthData[row.category]) || 0;
            row[`month${month}`] = value;
        });
    });

    // 합계 계산
    gridData.forEach(row => {
        row.total = Object.keys(row)
            .filter(key => key.startsWith('month'))
            .reduce((sum, key) => sum + (row[key] || 0), 0);
    });

    return gridData;
}

//검색 기능 실행 함수
function search() {
    const keyword = $('#basicInput').val().trim();
    loadMainGrid(keyword);
}

// 급여 항목 컬럼 정의 - 재사용 가능한 형태로 구성
const SALARY_COLUMNS = [
    { header: '기본급', name: 'empSalary', width: 100 },
    { header: '기술수당', name: 'techAllowance', width: 100 },
    { header: '근속수당', name: 'tenureAllowance', width: 100 },
    { header: '성과급', name: 'performanceBonus', width: 100 },
    { header: '명절수당', name: 'holidayAllowance', width: 100 },
    { header: '휴가수당', name: 'leaveAllowance', width: 100 },
    { header: '수당총액', name: 'allowAmt', width: 120 },
    { header: '국민연금', name: 'nationalPension', width: 100 },
    { header: '장기요양보험', name: 'longtermCareInsurance', width: 100 },
    { header: '건강보험', name: 'healthInsurance', width: 100 },
    { header: '고용보험', name: 'employmentInsurance', width: 100 },
    { header: '소득세', name: 'incomeTax', width: 100 },
    { header: '주민세', name: 'residentTax', width: 100 },
    { header: '공제총액', name: 'deducAmt', width: 120 },
    { header: '실지급액', name: 'netSalary', width: 120 }
].map(col => ({
    ...col,
    align: 'right',
    formatter: ({value}) => formatNumber(value)
}));

//부서별 급여 그리드 컨테이너 생성 함수
function createDepartmentGrids() {
    const departments = ['인사', '마케팅', '영업', '개발', '재무', '고객관리'];
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = '';
    
    // 각 부서별 그리드 컨테이너 생성
    departments.forEach(dept => {
        const container = document.createElement('div');
        container.className = 'department-container mb-4';
        container.innerHTML = `
            <h5 class="mb-3 mt-4">${dept}부서 급여 현황</h5>
            <div id="grid_${dept}" class="department-grid"></div>
        `;
        modalBody.appendChild(container);
    });

    // 전체 합계 그리드 컨테이너 추가
    const totalContainer = document.createElement('div');
    totalContainer.className = 'total-container mb-4';
    totalContainer.innerHTML = `
        <h5 class="mb-3 mt-4">전체 급여 합계</h5>
        <div id="grid_total" class="total-grid"></div>
    `;
    modalBody.appendChild(totalContainer);
}

//부서별 그리드 초기화 함수
//@param {string} elementId - 그리드를 생성할 DOM 요소 ID
//@param {Array} data - 그리드에 표시할 데이터
//@param {boolean} isTotalGrid - 전체 합계 그리드 여부
//@returns {Grid} 초기화된 그리드 인스턴스
function initializeDepartmentGrid(elementId, data, isTotalGrid = false) {
    const baseColumns = isTotalGrid ? [
        { header: '구분', name: 'empId', width: 100, align: 'center' }
    ] : [
        { header: '사원번호', name: 'empId', width: 100, align: 'center' },
        { header: '성명', name: 'empName', width: 100, align: 'center' },
        { header: '직급명', name: 'positionName', width: 100, align: 'center' }
    ];

    const gridOptions = {
        el: document.getElementById(elementId),
        data: data,
        scrollX: true,
        scrollY: false,
        bodyHeight: 'auto',
        minBodyHeight: isTotalGrid ? 50 : 100,
        rowHeaders: ['rowNum'],
        columns: [...baseColumns, ...SALARY_COLUMNS]
    };

    // 합계 행 설정 (전체 합계 그리드가 아닌 경우에만)
    if (!isTotalGrid) {
        gridOptions.summary = createSummaryOptions();
    }

    return new tui.Grid(gridOptions);
}

//그리드 합계 행 옵션 생성 함수 
//@returns {Object} 합계 행 설정 객체
function createSummaryOptions() {
    const summaryContent = {
        empId: { 
            template: () => '<div style="text-align: center; font-weight: bold;">합계</div>'
        },
        empName: { template: () => '' },
        positionName: { template: () => '' }
    };

    // 급여 항목별 합계 템플릿 추가
    SALARY_COLUMNS.forEach(col => {
        summaryContent[col.name] = {
            template: (valueMap) => `<div style="text-align: right; font-weight: bold;">
                ${formatNumber(valueMap.sum)}</div>`
        };
    });

    return {
        position: 'bottom',
        height: 40,
        columnContent: summaryContent
    };
}

//전체 합계 계산 함수
//@param {Object} departmentData - 부서별 데이터
//@returns {Object} 계산된 전체 합계 데이터
function calculateTotalSummary(departmentData) {
    const summary = {
        empId: '총계',
        empName: '',
        positionName: '',
        ...Object.fromEntries(
            SALARY_COLUMNS.map(col => [col.name, 0])
        )
    };

    // 모든 부서의 데이터 합산
    Object.values(departmentData).forEach(deptEmployees => {
        deptEmployees.forEach(emp => {
            SALARY_COLUMNS.forEach(col => {
                summary[col.name] += Number(emp[col.name] || 0);
            });
        });
    });

    return summary;
}

//상세 그리드 데이터 로드 함수
//@param {string} paymentDate - 급여 지급일
async function loadDetailGrid(paymentDate) {
    try {
        const data = await fetchAPI('/api/payroll/pay-list/detail', { paymentDate });
        
        // 부서별 그리드 생성
        createDepartmentGrids();
        
        // 부서별 데이터 분류
        const departments = ['인사', '마케팅', '영업', '개발', '재무', '고객관리'];
        const departmentData = {};
        departments.forEach(dept => {
            departmentData[dept] = data.filter(item => 
                item.departmentName.includes(dept)
            );
        });
        
        // 각 부서별 그리드 초기화
        departments.forEach(dept => {
            departmentGrids[dept] = initializeDepartmentGrid(
                `grid_${dept}`, 
                departmentData[dept]
            );
        });
        
        // 전체 합계 데이터 계산 및 그리드 초기화
        const totalSummary = calculateTotalSummary(departmentData);
        departmentGrids['total'] = initializeDepartmentGrid(
            'grid_total',
            [totalSummary],
            true
        );
        
        // 모든 그리드 레이아웃 새로고침
        Object.values(departmentGrids).forEach(grid => grid?.refreshLayout());
        
        // 모달 제목 업데이트
        $('#payrollDetailModalTitle').text(
            `${paymentDate} 급여대장`
        );
    } catch (error) {
        console.error('Error:', error);
        alert('상세 데이터 로드 중 오류가 발생했습니다.');
    }
}