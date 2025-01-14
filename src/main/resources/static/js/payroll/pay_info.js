// ================== 초기 설정 및 유틸리티 함수 ==================

// CSRF 토큰 설정
const token = $("meta[name='_csrf']").attr("content");
const header = $("meta[name='_csrf_header']").attr("content");

// 권한 체크 함수
function hasRole(role) {
    const userRoles = document.querySelector('meta[name="user-roles"]')?.content;
    return userRoles && userRoles.includes(role);
}

// 유틸리티 함수
const utils = {
    formatNumber: num => num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0',
    sortByDate: (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
};

// 지급월 형식 통일을 위한 함수
function formatPaymentMonth(value) {
    let date = value.replace(/[^0-9]/g, '');
    
    if (date.length !== 6) {
        return null;
    }

    let year = date.slice(0, 4);
    let month = date.slice(4);

    if (year < '2000' || year > '2100' || month < '01' || month > '12') {
        return null;
    }

    return `${year}-${month}`;
}

// ================== 그리드 설정 ==================

const gridConfig = {
    columns: {
        basic: ['paymentDate', 'empId', 'empName', 'departmentName', 'positionName'],
        money: [
            'empSalary',           // 기본급
            'techAllowance',       // 기술수당
            'tenureAllowance',     // 근속수당
            'performanceBonus',    // 성과급
            'holidayAllowance',    // 명절수당
            'leaveAllowance',      // 휴가수당
            'allowAmt',            // 총수당액
            'nationalPension',     // 국민연금
            'longtermCareInsurance', // 장기요양보험
            'healthInsurance',     // 건강보험
            'employmentInsurance', // 고용보험
            'incomeTax',           // 소득세
            'residentTax',         // 주민세
            'deducAmt',            // 총공제액
            'netSalary'            // 실지급액
        ],
        headers: {
            paymentDate: '지급월',
            empId: '사원번호',
            empName: '사원이름',
            departmentName: '부서',
            positionName: '직급',
            empSalary: '기본급',
            techAllowance: '기술수당',
            tenureAllowance: '근속수당',
            performanceBonus: '성과급',
            holidayAllowance: '명절수당',
            leaveAllowance: '휴가수당',
            allowAmt: '총수당액',
            nationalPension: '국민연금',
            longtermCareInsurance: '장기요양보험',
            healthInsurance: '건강보험',
            employmentInsurance: '고용보험',
            incomeTax: '소득세',
            residentTax: '주민세',
            deducAmt: '총공제액',
            netSalary: '실지급액'
        }
    },
    getColumnDefinitions() {
        return Object.entries(this.columns.headers).map(([key, header]) => {
            const column = {
                header,
                name: key,
                width: 110,
                align: 'center'
            };
			
			// 금액 컬럼인 경우 천단위 구분자 formatter 추가
            if (this.columns.money.includes(key)) {
                column.align = 'right'; // 금액은 우측 정렬
                column.formatter = (value) => {
                    if (!value.value && value.value !== 0) return '';
                    return value.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                };
            }

            switch(key) {
                case 'empId':
                    column.editor = false;
                    column.className = 'clickable-cell';
                    column.validation = { required: true };
                    break;
                case 'paymentDate':
                    column.editor = {
                        type: 'text',
                        options: { maxLength: 7 }
                    };
                    column.validation = {
                        required: true,
                        dataType: 'string',
                        validator: value => formatPaymentMonth(value) !== null
                    };
                    column.formatter = (value) => {
                        if (!value.value) return '예시) 202501';
                        return formatPaymentMonth(value.value) || value.value;
                    };
                    break;
                default:
                    column.editor = false;
            }
            return column;
        });
    }
};

// ================== 전역 변수 ==================

let selectedRowKey = null;
let employeeGrid = null;
let grid = null;
let missingPaymentGrid = null; 

// ================== 그리드 초기화 및 이벤트 바인딩 ==================

// 메인 그리드 초기화
function initializeMainGrid(isRegularEmployee) {
    grid = new tui.Grid({
        el: document.getElementById('grid'),
        data: [],
        columns: gridConfig.getColumnDefinitions(),
        rowHeaders: isRegularEmployee ? [] : ['checkbox'],
        scrollX: true,
        scrollY: false,
        bodyHeight: 400,
        editingEvent: isRegularEmployee ? 'none' : 'click'
    });

    // 그리드 이벤트 바인딩
	if (!isRegularEmployee) {
	    grid.on('click', (ev) => {
	        if (ev.columnName === 'empId') {
	            openEmployeeSearch(ev.rowKey);
	        }
	    });
	}

    // 편집 완료 이벤트
    grid.on('editingFinish', ({columnName, rowKey, value}) => {
        if(['empSalary','allowAmt', 'deducAmt'].includes(columnName)) {
            const rowData = grid.getRow(rowKey);
            const empSalary = Number(rowData.empSalary) || 0;
            const allowAmt = Number(rowData.allowAmt) || 0;
            const deducAmt = Number(rowData.deducAmt) || 0;
            const netSalary = empSalary + allowAmt - deducAmt;
            grid.setValue(rowKey, 'netSalary', netSalary);
        }
    });
}

// ================== 데이터 로드 및 검색 함수 ==================

// 부서 목록 로드
function loadDepartments() {
    $.ajax({
        url: '/api/payroll/pay-info/departments',
        type: 'GET',
        success: function(departments) {
            const select = $('#searchDepartment');
            const modalSelect = $('#empSearchDept');

            [select, modalSelect].forEach(el => {
                el.empty().append($('<option>', {
                    value: '',
                    text: '전체 부서'
                }));

                if (Array.isArray(departments)) {
                    departments.forEach(dept => {
                        el.append($('<option>', {
                            value: dept.COMMONDETAILCODE,
                            text: dept.COMMONDETAILNAME
                        }));
                    });
                }
            });
        },
        error: function(error) {
            console.error('부서 목록 로드 실패:', error);
        }
    });
}

// 초기 데이터 로드
function loadInitialData() {
    const isRegularEmployee = hasRole('ROLE_ATHR003');
    
    $.ajax({
        url: '/api/payroll/pay-info/search',  // URL 수정
        type: 'GET',
        data: {
            department: '',
            keyword: '',
            searchType: 'main'
        },
        success: function(data) {
            if (Array.isArray(data)) {
                const gridData = formatGridData(data).sort(utils.sortByDate);
                grid.resetData(gridData);
            }
        },
        error: function(xhr, status, error) {
            console.error('초기 데이터 로드 실패:', error);
        }
    });
}

// 메인 검색 기능
function searchPayInfo() {
    const department = $('#searchDepartment').val() || '';
    const keyword = $('#searchKeyword').val() || '';

    $.ajax({
        url: '/api/payroll/pay-info/search',
        type: 'GET',
        data: { 
            department: department, 
            keyword: keyword,
            searchType: 'main'
        },
        success: function(data) {
            if (Array.isArray(data)) {
                const formattedData = formatGridData(data);
                grid.resetData(formattedData);
                grid.refreshLayout();

                if (formattedData.length === 0) {
                    alert('검색 결과가 없습니다.');
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('검색 에러:', error);
            alert('검색 중 오류가 발생했습니다.');
        }
    });
}
// ================== 모달 관련 함수 ==================

// 사원 검색 모달 열기
function openEmployeeSearch(rowKey) {
    selectedRowKey = rowKey;
    const modalElement = document.getElementById('employeeSearchModal');
    
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
        existingModal.dispose();
    }

    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.addEventListener('shown.bs.modal', function () {
        if (!employeeGrid) {
            initializeEmployeeGrid();
        }
        loadEmployees();
    });

    modal.show();
}

// 모달 내 그리드 초기화
function initializeEmployeeGrid() {
    employeeGrid = new tui.Grid({
        el: document.getElementById('employeeGrid'),
        columns: [
            {
                header: '사원번호',
                name: 'empId',
                width: 200,
                align: 'center'
            },
            {
                header: '사원명',
                name: 'empName',
                width: 160,
                align: 'center'
            },
            {
                header: '부서',
                name: 'departmentName',
                width: 170,
                align: 'center'
            },
            {
                header: '직급',
                name: 'positionName',
                width: 170,
                align: 'center'
            }
        ],
        rowHeaders: ['checkbox'],
        minBodyHeight: 300,
        bodyHeight: 'auto',
        width: 'auto'
    });
}

// 모달 내 사원 목록 로드
function loadEmployees() {
    const department = $('#empSearchDept').val() || '';
    const keyword = $('#empSearchKeyword').val() || '';

    $.ajax({
        url: '/api/payroll/pay-info/search',
        type: 'GET',
        data: {
            department: department,
            keyword: keyword,
            searchType: 'modal'
        },
        success: function(data) {
            if (Array.isArray(data)) {
                employeeGrid.resetData(data);
                employeeGrid.refreshLayout();
            }
        },
        error: function(error) {
            console.error('사원 목록 로드 실패:', error);
            employeeGrid.resetData([]);
        }
    });
}

// 모달에서 사원 선택
function selectEmployee() {
    const selectedRows = employeeGrid.getCheckedRows();

    if (selectedRows.length === 0) {
        alert('사원을 선택해주세요.');
        return;
    }

    if (selectedRows.length > 1) {
        alert('한 명의 사원만 선택해주세요.');
        return;
    }

    const selectedEmployee = selectedRows[0];
    updateGridWithSelectedEmployee(selectedEmployee);
}

document.querySelector('#employeeSearchModal .modal-footer').innerHTML = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
    <button type="button" class="btn btn-primary" onclick="selectEmployee()">
        선택
    </button>
`;

// 로딩 스피너 표시/숨김
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'position-fixed w-100 h-100 d-flex justify-content-center align-items-center';
    spinner.style.cssText = 'top:0;left:0;background-color:rgba(0,0,0,0.3);z-index:9999;';
    spinner.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">처리중...</span>
        </div>
    `;
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}


// 선택된 사원 정보로 그리드 업데이트
function updateGridWithSelectedEmployee(employee) {
    const rowKey = selectedRowKey;
    
    // 기본 정보만 설정
    grid.setValue(rowKey, 'empId', employee.empId);
    grid.setValue(rowKey, 'empName', employee.empName);
    grid.setValue(rowKey, 'departmentName', employee.departmentName);
    grid.setValue(rowKey, 'positionName', employee.positionName);

    // 미저장 행 스타일 적용
    grid.addRowClassName(rowKey, 'unsaved-row');

    // 지급월 입력 받기
    const paymentDate = prompt('지급월을 입력하세요 (예: 2024-01)');
    if (paymentDate) {
        const formattedDate = formatPaymentMonth(paymentDate);
        if (formattedDate) {
            grid.setValue(rowKey, 'paymentDate', formattedDate);
            // 급여 계산만 실행 (저장하지 않음)
            calculateSalary(employee.empId, formattedDate, rowKey);
        } else {
            alert('올바른 지급월 형식으로 입력해주세요 (예: 2024-01)');
        }
    }

    closeEmployeeModal();
}

// 급여 계산 함수 (저장하지 않고 화면에만 표시)
async function calculateSalary(empId, paymentDate, rowKey) {
    try {
        showLoadingSpinner();
        
        const response = await $.ajax({
            url: '/api/payroll/calculator/calculate',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                empId: empId,
                paymentDate: paymentDate
            })
        });

        if (response.status === 'success' && response.data) {
            // 계산된 결과를 그리드에만 표시
            const calculatedData = response.data;
            const fields = [
                'empSalary', 'techAllowance', 'tenureAllowance', 
                'performanceBonus', 'holidayAllowance', 'leaveAllowance',
                'allowAmt', 'nationalPension', 'healthInsurance',
                'longtermCareInsurance', 'employmentInsurance',
                'incomeTax', 'residentTax', 'deducAmt', 'netSalary'
            ];

            fields.forEach(field => {
                if (calculatedData[field] !== undefined) {
                    grid.setValue(rowKey, field, calculatedData[field]);
                }
            });

            // 미저장 상태 표시
            grid.addRowClassName(rowKey, 'unsaved-row');
            grid.refreshLayout();
        }
    } catch (error) {
        console.error('급여 계산 중 오류:', error);
        alert('급여 계산 중 오류가 발생했습니다.');
    } finally {
        hideLoadingSpinner();
    }
}

// 일괄 계산 및 저장
async function bulkCalculateAndSave() {
    const {createdRows, updatedRows} = grid.getModifiedRows();
    const modifiedData = [...createdRows, ...updatedRows];

    if (!modifiedData.length) {
        alert('저장할 데이터가 없습니다.');
        return;
    }

    // 유효성 검사
    for (const row of modifiedData) {
        if (!row.empId || !row.paymentDate) {
            alert('사원번호와 지급월은 필수입니다. 미입력된 행이 있습니다.');
            return;
        }
    }

    if (!confirm(`총 ${modifiedData.length}건의 급여를 저장하시겠습니까?`)) {
        return;
    }

    try {
        showLoadingSpinner();

        // 저장 요청
        const response = await $.ajax({
            url: '/api/payroll/pay-info/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(modifiedData)
        });

        if (response.status === 'success') {
            alert('저장이 완료되었습니다.');
            location.reload();
        } else {
            throw new Error(response.message || '저장 중 오류가 발생했습니다.');
        }

    } catch (error) {
        console.error('저장 실패:', error);
        alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
        hideLoadingSpinner();
    }
}

const style = document.createElement('style');
style.textContent = `
    .unsaved-row td {
        background-color: #fff3e0 !important;
    }
`;
document.head.appendChild(style);

// 그리드 초기화 시 클래스 추가
// 메인 그리드 초기화
function initializeMainGrid(isRegularEmployee) {
    grid = new tui.Grid({
		el: document.getElementById('grid'),
        data: [],
        columns: gridConfig.getColumnDefinitions(),
        rowHeaders: isRegularEmployee ? [] : ['checkbox'],
        scrollX: true,
        scrollY: false,
        bodyHeight: 400,
        editingEvent: isRegularEmployee ? 'none' : 'click'
    });

	// 클릭 이벤트 핸들링
    grid.on('click', (ev) => {
        if (ev.columnName === 'empId') {
            openEmployeeSearch(ev.rowKey);
        }
    });

    // 행이 추가될 때마다 스타일 적용
	grid.on('afterChange', (ev) => {
	        const rowKey = ev.changes[0]?.rowKey;
	        if (rowKey !== undefined) {
	            const row = grid.getRow(rowKey);
	            if (!row.paymentNo) {
	                grid.addRowClassName(rowKey, 'unsaved-row');
	            }
	        }
    });

    // 데이터 로드 후 스타일 적용
    grid.on('onGridMounted', () => {
        grid.refreshLayout();
    });
}

// 모달 닫기
function closeEmployeeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('employeeSearchModal'));
    modal.hide();
}

// ================== 미지급자 조회 관련 함수 ==================

// 미지급자 확인 그리드 초기화
function initializeMissingPaymentGrid() {
    missingPaymentGrid = new tui.Grid({
        el: document.getElementById('missingPaymentGrid'),
        data: [],
        columns: [
            {
                header: '사원번호',
                name: 'empId',
                width: 210,
                align: 'center',
                formatter: function(cell) {
                    return cell.value; // 직접 value 값을 반환
                }
            },
            {
                header: '사원명',
                name: 'empName',
                width: 150,
                align: 'center',
                formatter: function(cell) {
                    return cell.value;
                }
            },
            {
                header: '부서',
                name: 'departmentName',
                width: 200,
                align: 'center',
                formatter: function(cell) {
                    return cell.value;
                }
            },
            {
                header: '직급',
                name: 'positionName',
                width: 150,
                align: 'center',
                formatter: function(cell) {
                    return cell.value;
                }
            }
        ],
        rowHeaders: ['checkbox'],
        bodyHeight: 300,
        minBodyHeight: 30,
        width: 'auto'
    });

    // 그리드 테마 설정
    missingPaymentGrid.setWidth('100%');
}

// 미지급자 조회
function checkMissingPayment() {
    const paymentDate = $('#missingPaymentMonth').val();
    if (!paymentDate) {
        alert('조회할 지급월을 선택해주세요.');
        return;
    }

	$.ajax({
	        url: '/api/payroll/pay-info/missing',
	        type: 'GET',
	        data: { paymentDate: paymentDate },
	        success: function(response) {
	            if (response && response.data) {
	                const gridData = response.data.map(item => ({
	                    empId: item.EMPID || item.empId,
	                    empName: item.EMPNAME || item.empName,
	                    departmentName: item.DEPARTMENTNAME || item.departmentName,
	                    positionName: item.POSITIONNAME || item.positionName
	                }));
	                
	                // 데이터 설정 전 로그 출력
	                console.log('Setting grid data:', gridData);
	                
	                missingPaymentGrid.resetData(gridData);
	                $('#missingPaymentMessage').text(response.message || '');
	                
	                // 그리드 새로고침
	                missingPaymentGrid.refreshLayout();
	            } else {
	                missingPaymentGrid.resetData([]);
	                $('#missingPaymentMessage').text('데이터가 없습니다.');
	            }
	        },
	        error: function(xhr, status, error) {
	            console.error('Error:', error);
	            alert('조회 중 오류가 발생했습니다.');
	        }
	    });
}

// 미지급자 일괄 추가 함수
async function addMissingEmployees() {
    const checkedRows = missingPaymentGrid.getCheckedRows();
    if (checkedRows.length === 0) {
        alert('추가할 직원을 선택해주세요.');
        return;
    }

    const paymentMonth = $('#missingPaymentMonth').val();
    if (!paymentMonth) {
        alert('지급월을 선택해주세요.');
        return;
    }

    showLoadingSpinner();

    try {
        // 선택된 각 직원에 대해 급여 계산
        for (const employee of checkedRows) {
            // 새 행 추가
            const rowKey = grid.getRowCount();
            const newRow = {
                empId: employee.EMPID || employee.empId,
                empName: employee.EMPNAME || employee.empName,
                departmentName: employee.DEPARTMENTNAME || employee.departmentName,
                positionName: employee.POSITIONNAME || employee.positionName,
                paymentDate: paymentMonth
            };
            
            grid.appendRow(newRow);
            
            // 급여 계산하여 그리드에 표시
            try {
                const response = await $.ajax({
                    url: '/api/payroll/calculator/calculate',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        empId: newRow.empId,
                        paymentDate: paymentMonth
                    })
                });

                if (response.status === 'success' && response.data) {
                    const calculatedData = response.data;
                    // 계산된 값을 그리드에 표시
                    ['empSalary', 'techAllowance', 'tenureAllowance', 
                     'performanceBonus', 'holidayAllowance', 'leaveAllowance',
                     'allowAmt', 'nationalPension', 'healthInsurance',
                     'longtermCareInsurance', 'employmentInsurance',
                     'incomeTax', 'residentTax', 'deducAmt', 'netSalary'
                    ].forEach(field => {
                        if (calculatedData[field] !== undefined) {
                            grid.setValue(rowKey, field, calculatedData[field]);
                        }
                    });
                    
                    // 미저장 행 스타일 적용
                    grid.addRowClassName(rowKey, 'unsaved-row');
                }
            } catch (error) {
                console.error('급여 계산 중 오류:', error);
            }
        }

        hideLoadingSpinner();
        alert(`${checkedRows.length}명의 직원이 추가되었습니다.`);
        const modal = bootstrap.Modal.getInstance(document.getElementById('missingPaymentModal'));
        modal?.hide();

    } catch (error) {
        hideLoadingSpinner();
        console.error('Error:', error);
        alert('처리 중 오류가 발생했습니다.');
    }
}

// ================== 데이터 저장 관련 함수 ==================

// 중복 체크 함수
function checkDuplicatePaymentMonth(modifiedData) {
    const paymentMonths = new Map(); 

    for (const row of modifiedData) {
        if (!row.empId || !row.paymentDate) {
            return '사원번호와 지급월은 필수 입력 항목입니다.';
        }

        const key = `${row.empId}_${row.paymentDate}`;
        if (paymentMonths.has(key)) {
            return `${row.empId} 사원의 ${row.paymentDate} 지급월이 중복되었습니다.`;
        }
        paymentMonths.set(key, true);
    }
    return null;
}

// 저장 함수
function savePaymentData() {
    const {createdRows, updatedRows} = grid.getModifiedRows();
    const modifiedData = [...createdRows, ...updatedRows];

    if (!modifiedData.length) {
        alert('저장할 데이터가 없습니다.');
        return;
    }

    // 필수 입력 체크
    const invalidRows = modifiedData.filter(row => 
        !row.empId || !row.paymentDate
    );

    if (invalidRows.length > 0) {
        alert('필수 항목을 입력해주세요');
        return;
    }

    // 데이터 유효성 검사
    for (const row of modifiedData) {
        if (row.paymentDate) {
            const formatted = formatPaymentMonth(row.paymentDate);
            if (!formatted) {
                alert('올바르지 않은 지급월 형식이 있습니다.\n예: 2025-01 또는 202501');
                return;
            }
            row.paymentDate = formatted;
        }
    }

    // 중복 체크
    const duplicateError = checkDuplicatePaymentMonth(modifiedData);
    if (duplicateError) {
        alert(duplicateError);
        return;
    }

    // 데이터 저장 요청
    $.ajax({
        url: '/api/payroll/pay-info/save',
		        type: 'POST',
		        contentType: 'application/json',
		        data: JSON.stringify(modifiedData.map(row => ({
		            paymentNo: row.paymentNo || null,
		            empId: row.empId,
		            paymentDate: row.paymentDate,
		            empSalary: Number(row.empSalary || 0),
		            techAllowance: Number(row.techAllowance || 0),
		            tenureAllowance: Number(row.tenureAllowance || 0),
		            performanceBonus: Number(row.performanceBonus || 0),
		            holidayAllowance: Number(row.holidayAllowance || 0),
		            leaveAllowance: Number(row.leaveAllowance || 0),
		            allowAmt: Number(row.allowAmt || 0),
		            nationalPension: Number(row.nationalPension || 0),
		            longtermCareInsurance: Number(row.longtermCareInsurance || 0),
		            healthInsurance: Number(row.healthInsurance || 0),
		            employmentInsurance: Number(row.employmentInsurance || 0),
		            incomeTax: Number(row.incomeTax || 0),
		            residentTax: Number(row.residentTax || 0),
		            deducAmt: Number(row.deducAmt || 0),
		            netSalary: Number(row.netSalary || 0)
		        }))),
		        success: function(response) {
		            if(response.status === 'success') {
		                alert(response.message);
		                location.reload();
		            } else {
		                alert(response.message || '저장 중 오류가 발생했습니다.');
		            }
		        },
		        error: function(xhr, status, error) {
		            const errorMessage = xhr.responseJSON?.message || '저장 중 오류가 발생했습니다.';
		            alert(errorMessage);
		            console.error('Error:', error);
		        }
		    });
		}

		// ================== 유틸리티 함수 ==================

		// 데이터 포맷팅
		function formatGridData(data) {
		    return data.map(item => ({
		        paymentNo: item.paymentNo,
		        paymentDate: item.paymentDate,
		        empId: item.empId,
		        empName: item.empName,
		        departmentName: item.departmentName,
		        positionName: item.positionName,
		        empSalary: Number(item.empSalary || 0),
		        techAllowance: Number(item.techAllowance || 0),
		        tenureAllowance: Number(item.tenureAllowance || 0),
		        performanceBonus: Number(item.performanceBonus || 0),
		        holidayAllowance: Number(item.holidayAllowance || 0),
		        leaveAllowance: Number(item.leaveAllowance || 0),
		        allowAmt: Number(item.allowAmt || 0),
		        nationalPension: Number(item.nationalPension || 0),
		        longtermCareInsurance: Number(item.longtermCareInsurance || 0),
		        healthInsurance: Number(item.healthInsurance || 0),
		        employmentInsurance: Number(item.employmentInsurance || 0),
		        incomeTax: Number(item.incomeTax || 0),
		        residentTax: Number(item.residentTax || 0),
		        deducAmt: Number(item.deducAmt || 0),
		        netSalary: Number(item.netSalary || 0),
		        createAt: item.createAt,
		        createBy: item.createBy
		    }));
		}

		// 추가 버튼 클릭시 새 행 추가 함수
		function addPaymentRow() {
		    const rowData = {};
		    const newRowKey = grid.getRowCount();
		    grid.appendRow(rowData);
		    grid.addRowClassName(newRowKey, 'unsaved-row');
		    
		    // 새로 추가된 행 선택
		    selectedRowKey = newRowKey;
		    
		    // 사원 검색 모달 열기
		    openEmployeeSearch(newRowKey);
		}

		// ================== 초기화 및 이벤트 바인딩 ==================

		$(document).ready(function() {
		    const isRegularEmployee = hasRole('ROLE_ATHR003');
		    
		    // jQuery AJAX 설정
		    $.ajaxSetup({
		        beforeSend: function(xhr) {
		            xhr.setRequestHeader(header, token);
		        }
		    });
		    
		    // 권한에 따른 UI 설정
		    if (isRegularEmployee) {
		        $('#searchForm').hide();
		        $('#addPaymentButton').hide();
		        $('#savePaymentButton').hide();
		    }

		    // 부서 목록 로드 (관리자만)
		    if (!isRegularEmployee) {
		        loadDepartments();
		        
		        // 검색 이벤트 바인딩
		        $('#searchBtn').on('click', searchPayInfo);
		        $('#searchForm').on('keypress', function(e) {
		            if (e.which === 13) {
		                e.preventDefault();
		                searchPayInfo();
		            }
		        });
		        
		        // 모달 검색 이벤트 바인딩
		        $('#empSearchDept, #empSearchKeyword').on('change', loadEmployees);
		        $('#empSearchBtn').on('click', loadEmployees);
		    }
			
			// 미지급자 조회 모달 이벤트 바인딩
			   $('#missingPaymentModal').on('shown.bs.modal', function () {
			       if (!missingPaymentGrid) {
			           initializeMissingPaymentGrid();
			       }
			       missingPaymentGrid.refreshLayout();
			 	});
			
		    // 그리드 초기화
		    initializeMainGrid(isRegularEmployee);
		    loadInitialData();
		});
		
		// 급여 계산 함수
		async function calculateSalary(empId, paymentDate, rowKey) {
		    try {
		        const response = await $.ajax({
		            url: '/api/payroll/calculator/calculate',
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify({
		                empId: empId,
		                paymentDate: paymentDate
		            })
		        });

		        if (response.status === 'success' && response.data) {
		            const calculatedData = response.data;
		            
		            // 그리드에만 데이터 표시 (저장하지 않음)
		            const fields = [
		                'empSalary', 'techAllowance', 'tenureAllowance', 
		                'performanceBonus', 'holidayAllowance', 'leaveAllowance',
		                'allowAmt', 'nationalPension', 'healthInsurance',
		                'longtermCareInsurance', 'employmentInsurance',
		                'incomeTax', 'residentTax', 'deducAmt', 'netSalary'
		            ];

		            fields.forEach(field => {
		                if (calculatedData[field] !== undefined) {
		                    grid.setValue(rowKey, field, calculatedData[field]);
		                }
		            });

		            // 미저장 스타일 적용
		            grid.addRowClassName(rowKey, 'unsaved-row');
		            grid.refreshLayout();
		        }
		    } catch (error) {
		        console.error('급여 계산 중 오류:', error);
		        alert('급여 계산 중 오류가 발생했습니다.');
		    }
		}

		// 계산된 데이터로 그리드 업데이트하는 함수
		function updateGridWithCalculatedData(data) {
		    const rowKey = selectedRowKey;
		    Object.entries(data).forEach(([key, value]) => {
		        grid.setValue(rowKey, key, value);
		    });
		}
		
		// 선택된 사원 정보로 그리드 업데이트
		async function updateGridWithSelectedEmployee(employee) {
		    try {
		        const rowKey = selectedRowKey;

		        // 기본 정보만 그리드에 표시
		        grid.setRow(rowKey, {
		            empId: employee.empId,
		            empName: employee.empName,
		            departmentName: employee.departmentName,
		            positionName: employee.positionName
		        });

		        // 지급월 입력 받기
		        const paymentDate = prompt('지급월을 입력하세요 (예: 2024-01)');
		        if (!paymentDate) {
		            grid.removeRow(rowKey);
		            return;
		        }

		        const formattedDate = formatPaymentMonth(paymentDate);
		        if (!formattedDate) {
		            alert('올바른 지급월 형식으로 입력해주세요 (예: 2024-01)');
		            grid.removeRow(rowKey);
		            return;
		        }

		        // 지급월 설정
		        grid.setValue(rowKey, 'paymentDate', formattedDate);

		        // 급여 계산 실행 (저장하지 않고 그리드에만 표시)
		        await calculateSalary(employee.empId, formattedDate, rowKey);

		        // 미저장 상태 표시
		        grid.addRowClassName(rowKey, 'unsaved-row');
		        
		    } catch (error) {
		        console.error('Error:', error);
		        alert('처리 중 오류가 발생했습니다.');
		    } finally {
		        closeEmployeeModal();
		    }
		}
		
		// 급여명세서 다운로드 요청 함수
		async function downloadPayslip() {
		    const checkedRows = grid.getCheckedRows();
		    if (checkedRows.length === 0) {
		        alert('명세서를 출력할 항목을 선택해주세요.');
		        return;
		    }
		    if (checkedRows.length > 1) {
		        alert('명세서는 한 번에 한 건만 출력할 수 있습니다.');
		        return;
		    }

		    const paymentNo = checkedRows[0].paymentNo;
		    const empName = checkedRows[0].empName;
		    if (!paymentNo) {
		        alert('저장되지 않은 데이터는 명세서를 출력할 수 없습니다.');
		        return;
		    }

		    try {
		        // 로딩 스피너 표시
		        showLoadingSpinner();

		        // 서버에 PDF 다운로드 요청
		        const url = `/api/payroll/pay-info/${paymentNo}/payslip?empName=${encodeURIComponent(empName)}`;
		        const response = await fetch(url);

		        if (response.ok) {
		            const blob = await response.blob();
		            const url = window.URL.createObjectURL(blob);
		            const a = document.createElement('a');
		            a.href = url;
		            a.download = `${empName}_${checkedRows[0].paymentDate}_급여명세서.pdf`;
		            document.body.appendChild(a);
		            a.click();
		            a.remove();
		            window.URL.revokeObjectURL(url);
		        } else {
		            throw new Error(`${response.status} ${response.statusText}`);
		        }
		    } catch (error) {
		        console.error('명세서 다운로드 실패:', error);
		        alert('명세서 다운로드 중 오류가 발생했습니다.');
		    } finally {
		        // 로딩 스피너 숨김
		        hideLoadingSpinner();
		    }
		}