// 전역 변수 선언
let mainGrid = null;
let departmentGrids = {};

$(document).ready(function() {
    // CSRF 설정
    const token = $("meta[name='_csrf']").attr("content");
    const header = $("meta[name='_csrf_header']").attr("content");
    
    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader(header, token);
        }
    });

    // 그리드 초기화
    initializeMainGrid();
    
    // 이벤트 바인딩
    bindEvents();
});

// 이벤트 바인딩 함수
function bindEvents() {
    // 검색 버튼 클릭 이벤트
    $('.btn-primary.rounded-pill').on('click', function(e) {
        e.preventDefault();
        search();
    });
    
    // 검색어 입력 엔터 이벤트
    $('#basicInput').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            search();
        }
    });
    
    // 모달 관련 이벤트
    $('#payrollDetailModal').on('shown.bs.modal', function () {
        // 모든 부서 그리드의 레이아웃 새로고침
        Object.values(departmentGrids).forEach(grid => {
            if (grid) {
                grid.refreshLayout();
            }
        });
    });
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
}

// 메인 그리드 초기화
function initializeMainGrid() {
    mainGrid = new tui.Grid({
        el: document.getElementById('mainGrid'),
        data: [],
        rowHeaders: [],
        bodyHeight: 400,
        columns: [
            { 
                header: '지급월', 
                name: 'formattedDate',
                align: 'center',
                width: 170
            },
            { 
                header: '대장명칭', 
                name: 'payrollName',
                align: 'center',
                width: 200
            },
            { 
                header: '인원수', 
                name: 'headcount',
                align: 'center',
                width: 150,
                formatter: ({value}) => `${formatNumber(value || 0)}명`
            },
            { 
                header: '급여대장', 
                name: 'payrollDetail',
                align: 'center',
                width: 100,
                formatter: () => '<span class="clickable">조회</span>'
            },
            { 
                header: '지급총액', 
                name: 'totalAmount',
                align: 'right',
                width: 200,
                formatter: ({value}) => `${formatNumber(value || 0)}원`
            }
        ]
    });

    // 조회 클릭 이벤트
    mainGrid.on('click', (ev) => {
        if (ev.columnName === 'payrollDetail') {
            const rowData = mainGrid.getRow(ev.rowKey);
            loadDetailGrid(rowData.paymentDate);
            const modal = new bootstrap.Modal(document.getElementById('payrollDetailModal'));
            modal.show();
        }
    });

    // 초기 데이터 설정
    if (typeof payListSummary !== 'undefined' && payListSummary.length > 0) {
        const formattedData = payListSummary.map(item => ({
            formattedDate: item.formattedDate,
            payrollName: item.payrollName,
            headcount: parseInt(item.headcount),
            payrollDetail: 'view',
            totalAmount: parseInt(item.totalAmount),
            paymentDate: item.paymentDate
        }));
        mainGrid.resetData(formattedData);
    } else {
        loadMainGrid();
    }
}

// 메인 그리드 데이터 로드
function loadMainGrid(keyword = '') {
    $.ajax({
        url: '/api/payroll/pay-list/summary',
        type: 'GET',
        data: { keyword: keyword },
        success: function(data) {
            if (Array.isArray(data)) {
                const formattedData = data.map(item => ({
                    formattedDate: item.formattedDate,
                    payrollName: item.payrollName,
                    headcount: parseInt(item.headcount) || 0,
                    payrollDetail: 'view',
                    totalAmount: parseInt(item.totalAmount) || 0,
                    paymentDate: item.paymentDate
                }));
                mainGrid.resetData(formattedData);
                mainGrid.refreshLayout();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error Details:', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText
            });
            alert('데이터 로드 중 오류가 발생했습니다.');
        }
    });
}

// 부서별 그리드 컨테이너 생성
function createDepartmentGrids() {
    const departments = ['인사', '마케팅', '영업', '개발', '재무', '고객관리'];
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = '';
    
    departments.forEach(dept => {
        const container = document.createElement('div');
        container.className = 'department-container mb-4';
        container.innerHTML = `
            <h5 class="mb-3 mt-4">${dept}부서 급여 현황</h5>
            <div id="grid_${dept}" class="department-grid"></div>
        `;
        modalBody.appendChild(container);
    });

    // 전체 합계 그리드 추가
    const totalContainer = document.createElement('div');
    totalContainer.className = 'total-container mb-4';
    totalContainer.innerHTML = `
        <h5 class="mb-3 mt-4">전체 급여 합계</h5>
        <div id="grid_total" class="total-grid"></div>
    `;
    modalBody.appendChild(totalContainer);
}

// 급여 항목 설정
const salaryColumns = [
    { header: '기본급', name: 'empSalary', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) , style:{textAlign : 'right'} },
    { header: '기술수당', name: 'techAllowance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '근속수당', name: 'tenureAllowance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '성과급', name: 'performanceBonus', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '명절수당', name: 'holidayAllowance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '휴가수당', name: 'leaveAllowance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '수당총액', name: 'allowAmt', width: 120, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '국민연금', name: 'nationalPension', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '장기요양보험', name: 'longtermCareInsurance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '건강보험', name: 'healthInsurance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '고용보험', name: 'employmentInsurance', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '소득세', name: 'incomeTax', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '주민세', name: 'residentTax', width: 100, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '공제총액', name: 'deducAmt', width: 120, align: 'right', formatter: ({value}) => formatNumber(value) },
    { header: '실지급액', name: 'netSalary', width: 120, align: 'right', formatter: ({value}) => formatNumber(value) }
];

// 부서별 그리드 초기화
function initializeDepartmentGrid(elementId, data, isTotalGrid = false) {
    let columns = [];
    
    if (isTotalGrid) {
        columns = [
            { header: '구분', name: 'empId', width: 100, align: 'center' },
            ...salaryColumns
        ];
    } else {
        columns = [
            { header: '사원번호', name: 'empId', width: 100, align: 'center' },
            { header: '성명', name: 'empName', width: 100, align: 'center' },
            { header: '직급명', name: 'positionName', width: 100, align: 'center' },
            ...salaryColumns
        ];
    }

    const gridOptions = {
        el: document.getElementById(elementId),
        data: data,
        scrollX: true,
        scrollY: false,
        bodyHeight: 'auto',
        minBodyHeight: isTotalGrid ? 50 : 100,
        rowHeaders: ['rowNum'],
        columns: columns
    };
	
	if (!isTotalGrid) {
	    gridOptions.summary = {
	        position: 'bottom',
	        height: 40,
	        columnContent: {
	            empId: { 
	                template: () => '<div style="text-align: center; font-weight: bold;">합계</div>'
	            },
	            empName: { 
	                template: () => '' 
	            },
	            positionName: { 
	                template: () => '' 
	            },
	            empSalary: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            techAllowance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            tenureAllowance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            performanceBonus: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            holidayAllowance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            leaveAllowance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            allowAmt: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            nationalPension: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            longtermCareInsurance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            healthInsurance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            employmentInsurance: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            incomeTax: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            residentTax: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            deducAmt: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            },
	            netSalary: {
	                template: (valueMap) => `<div style="text-align: right; font-weight: bold;">${formatNumber(valueMap.sum)}</div>`
	            }
	        }
	    };
	}
	return new tui.Grid(gridOptions);
}	
// 전체 합계 계산 함수
function calculateTotalSummary(departmentData) {
    const summary = {
        empId: '총계',
        empName: '',
        positionName: '',
        empSalary: 0,
        techAllowance: 0,
        tenureAllowance: 0,
        performanceBonus: 0,
        holidayAllowance: 0,
        leaveAllowance: 0,
        allowAmt: 0,
        nationalPension: 0,
        longtermCareInsurance: 0,
        healthInsurance: 0,
        employmentInsurance: 0,
        incomeTax: 0,
        residentTax: 0,
        deducAmt: 0,
        netSalary: 0
    };

    // 모든 부서의 데이터를 합산
    Object.values(departmentData).forEach(deptEmployees => {
        deptEmployees.forEach(emp => {
            Object.keys(summary).forEach(key => {
                if (typeof summary[key] === 'number') {
                    summary[key] += Number(emp[key] || 0);
                }
            });
        });
    });

    return summary;
}

// 상세 그리드 데이터 로드
function loadDetailGrid(paymentDate) {
    $.ajax({
        url: '/api/payroll/pay-list/detail',
        type: 'GET',
        data: { paymentDate: paymentDate },
        success: function(data) {
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
			            
			            // 각 부서별 그리드 초기화 및 데이터 설정
			            departments.forEach(dept => {
			                departmentGrids[dept] = initializeDepartmentGrid(`grid_${dept}`, departmentData[dept]);
			            });
			            
			            // 부서별 합계 데이터 계산
			            const totalSummary = calculateTotalSummary(departmentData);
			            
			            // 전체 합계 그리드 초기화
			            departmentGrids['total'] = initializeDepartmentGrid('grid_total', [totalSummary], true);
						
			            // 모든 그리드의 레이아웃 새로고침
			            Object.values(departmentGrids).forEach(grid => {
			                if (grid) {
			                    grid.refreshLayout();
			                }
			            });
			            
			            // 모달 제목 업데이트
			            const modalTitle = $('#payrollDetailModalTitle');
			            modalTitle.text(`${paymentDate.replace('-', '/')} 급여대장`);
			        },
			        error: function(xhr, status, error) {
			            console.error('Error:', error);
			            alert('상세 데이터 로드 중 오류가 발생했습니다.');
			        }
			    });
			}

			// 검색 기능
			function search() {
			    const keyword = $('#basicInput').val().trim();
			    loadMainGrid(keyword);
			}

