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
        basic: ['paymentDate', 'empId', 'empName', 'departmentName', 'positionName', 'empJobType'],
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
			empJobType: '근무형태',
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
	
	deptOrder: [
        'DEPT001', // 인사팀
        'DEPT002', // 마케팅
        'DEPT003', // 영업
        'DEPT004', // 개발
        'DEPT005',  // 재무
        'DEPT006'  // 고객관리
    ],

    // 직급 정렬 순서 정의
    positionOrder: [
        'PSTN001', // 대표이사
        'PSTN002', // 이사
        'PSTN004', // 부장
        'PSTN003', // 차장
        'PSTN005', // 팀장
        'PSTN006', // 대리
        'PSTN007',  // 주임
        'PSTN008'  // 사원
    ],
		
	getColumnDefinitions() {
	   return Object.entries(this.columns.headers).map(([key, header]) => {
	       const column = {
	           header,
	           name: key,
	           width: 110,
	           align: 'center',
	           sortable: ['paymentDate', 'empId', 'departmentName', 'positionName', 'empJobType'].includes(key)
	       };

	       // 금액 컬럼인 경우 천단위 구분자 formatter 추가
	       if (this.columns.money.includes(key)) {
	           column.align = 'right';
	           column.formatter = (value) => {
	               if (!value.value && value.value !== 0) return '';
	               return value.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	           };
	       }

	       switch(key) {
	           case 'empId':
	               column.editor = false;
	               column.formatter = (props) => {
	                   const row = grid.getRow(props.rowKey);
	                   if (row && !row.paymentNo) {
	                       return `<div class="clickable-cell-emp">${props.value}</div>`;
	                   }
	                   return props.value;
	               };
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
	               column.sortingType = 'desc';
	               break;

	           case 'departmentName':
	               column.editor = false;
	               column.sortingType = 'custom';
	               column.sortingFunction = (a, b, column) => {
	                   const deptOrder = {
	                       'DEPT001': 1, // 인사
	                       'DEPT002': 2, // 마케팅 
	                       'DEPT003': 3, // 영업
	                       'DEPT004': 4, // 개발
	                       'DEPT005': 5,  // 재무
	                       'DEPT006': 6  // 고객관리
	                   };
					   const aCode = a.departmentCode || '';
			           const bCode = b.departmentCode || '';
			           return (deptOrder[aCode] || 999) - (deptOrder[bCode] || 999);
	               };
	               break;

	           case 'positionName':
	               column.editor = false;
	               column.sortingType = 'custom';
	               column.sortingFunction = (a, b, column) => {
	                   const positionOrder = {
	                       'PSTN001': 1, // 대표이사
	                       'PSTN002': 2, // 이사
	                       'PSTN004': 4, // 부장
	                       'PSTN003': 3, // 차장
	                       'PSTN005': 5, // 팀장
	                       'PSTN006': 6, // 대리
	                       'PSTN007': 7,  // 주임
	                       'PSTN008': 8  // 사원
	                   };
					   const aCode = a.positionCode || '';
			           const bCode = b.positionCode || '';
			           return (positionOrder[aCode] || 999) - (positionOrder[bCode] || 999);
	               };
	               break;
				   
			   case 'empJobType':
                   column.formatter = (value) => {
                       const jobTypeMap = {
                           'OCPT001': '계약직',
                           'OCPT002': '일반직',
                           'OCPT003': '기술직'
                       };
                       return jobTypeMap[value.value] || value.value;
                   };
                   column.editor = false;
                   break;

	           default:
	               column.editor = false;
	       }
	       return column;
	   });
	}
};

// ================== 전역 변수 ==================

let grid = null;
let missingPaymentGrid = null; 

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
	const isRegularEmployee = hasRole('ROLE_ATHR003');
	
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

        // 지급월 입력 받고 검증
        const validatedDate = handlePaymentDateInput();
        if (!validatedDate) {
            grid.removeRow(rowKey);
            closeEmployeeModal();
            return;
        }

        // 지급월 설정
        grid.setValue(rowKey, 'paymentDate', validatedDate);

        // 급여 계산 실행 (저장하지 않고 그리드에만 표시)
        await calculateSalary(employee.empId, validatedDate, rowKey);

        // 미저장 상태 표시
        grid.addRowClassName(rowKey, 'unsaved-row');
        
    } catch (error) {
        console.error('Error:', error);
        alert('처리 중 오류가 발생했습니다.');
    } finally {
        closeEmployeeModal();
    }
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
    .tui-grid-cell-unsaved {
        background-color: #fff3e0 !important;
    }
    .tui-grid-row-unsaved td {
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
        scrollY: true,
        bodyHeight: 400,
        editingEvent: isRegularEmployee ? 'none' : 'click'
    });

    // 행이 추가될 때마다 스타일 적용
	grid.on('afterChange', (ev) => {
        const rows = grid.getData();
        rows.forEach((row, index) => {
            if (!row.paymentNo) {
                grid.addRowClassName(index, 'tui-grid-row-unsaved');
            } else {
                grid.removeRowClassName(index, 'tui-grid-row-unsaved');
            }
        });
    });
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
	                    positionName: item.POSITIONNAME || item.positionName,
						empJobType: item.EMPJOBTYPE || item.empJobType
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
	
	if (!isCurrentMonth(paymentMonth)) {
	        alert('현재 월의 데이터만 추가할 수 있습니다.');
	        return;
	    }
	
    showLoadingSpinner();

    try {
        // 선택된 각 직원에 대해 급여 계산
        for (const employee of checkedRows) {
            // 새 행 추가
            const newRow = {
                empId: employee.EMPID || employee.empId,
                empName: employee.EMPNAME || employee.empName,
                departmentName: employee.DEPARTMENTNAME || employee.departmentName,
                positionName: employee.POSITIONNAME || employee.positionName,
				empJobType: employee.EMPJOBTYPE || employee.empJobType,
                paymentDate: paymentMonth
            };
            
            const rowKey = grid.getRowCount();
            grid.prependRow(newRow);
			
			grid.addRowClassName(rowKey, 'unsaved-row');
            
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
// 현재 월 체크 함수 추가
function isCurrentMonth(dateStr) {
    const selectedDate = new Date(dateStr);
    const currentDate = new Date();
    return selectedDate.getFullYear() === currentDate.getFullYear() && 
           selectedDate.getMonth() === currentDate.getMonth();
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
            const validatedDate = validatePaymentDate(row.paymentDate);
            if (!validatedDate) {
                alert('올바른 지급월이 아니거나 미래의 지급월입니다.');
                return;
            }
            row.paymentDate = validatedDate;
        }
    }

    // 중복 체크
    const duplicateError = checkDuplicatePaymentMonth(modifiedData);
    if (duplicateError) {
        alert(duplicateError);
        return;
    }

    // 저장 요청
    $.ajax({
        url: '/api/payroll/pay-info/save',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(modifiedData.map(row => ({
            paymentNo: row.paymentNo || null,
            empId: row.empId,
            paymentDate: row.paymentDate,
            empSalary: Number(row.empSalary || 0),
            // ... (나머지 필드들)
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
				empJobType: item.empJobType,
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
		        
		    }
			
			// 미지급자 조회 모달 이벤트 바인딩
			$('#missingPaymentModal').on('shown.bs.modal', function () {
			    // 현재 날짜를 YYYY-MM 형식으로 가져오기
			    const today = new Date();
			    const year = today.getFullYear();
			    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
			    const currentYearMonth = `${year}-${month}`;
			    
			    // input에 현재 월 설정
			    $('#missingPaymentMonth').val(currentYearMonth);
			    
			    // 그리드 초기화
			    if (!missingPaymentGrid) {
			        initializeMissingPaymentGrid();
			    }
			    missingPaymentGrid.refreshLayout();
			    
			    // 자동으로 미지급자 조회 실행
			    checkMissingPayment();
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
		
		// 선택된 사원 정보로 그리드 업데이트 함수 수정
		async function updateGridWithSelectedEmployee(employee) {
		    try {
		        const rowKey = selectedRowKey;

		        // 기본 정보 설정
		        grid.setRow(rowKey, {
		            empId: employee.empId,
		            empName: employee.empName,
		            departmentName: employee.departmentName,
		            positionName: employee.positionName
		        });

		        // 지급월 입력 받기
		        const validatedDate = handlePaymentDateInput();
		        if (!validatedDate) {
		            grid.removeRow(rowKey);
		            closeEmployeeModal();
		            return;
		        }

		        // 지급월 설정
		        grid.setValue(rowKey, 'paymentDate', validatedDate);

		        // 급여 계산 실행
		        await calculateSalary(employee.empId, validatedDate, rowKey);

		        // 미저장 상태 표시
		        grid.addRowClassName(rowKey, 'unsaved-row');
		        
		    } catch (error) {
		        console.error('Error:', error);
		        alert('처리 중 오류가 발생했습니다.');
		        grid.removeRow(rowKey);
		    } finally {
		        closeEmployeeModal();
		    }
		}
		
		// 급여명세서 다운로드 요청 함수
		async function downloadPayslip() {
		    try {
		        const checkedRows = grid.getCheckedRows();
		        if (checkedRows.length === 0) {
		            alert('명세서를 출력할 항목을 선택해주세요.');
		            return;
		        }
		        if (checkedRows.length > 1) {
		            alert('명세서는 한 번에 한 건만 출력할 수 있습니다.');
		            return;
		        }

		        const row = checkedRows[0];
		        if (!row.paymentNo) {
		            alert('저장되지 않은 데이터는 명세서를 출력할 수 없습니다.');
		            return;
		        }

		        showLoadingSpinner();

		        const response = await fetch(
		            `/api/payroll/pay-info/${row.paymentNo}/payslip?empName=${encodeURIComponent(row.empName)}`,
		            {
		                headers: {
		                    [header]: token
		                }
		            }
		        );

		        if (!response.ok) {
		            throw new Error(`HTTP error! status: ${response.status}`);
		        }

		        const blob = await response.blob();
		        const url = window.URL.createObjectURL(blob);
		        const a = document.createElement('a');
		        a.href = url;
		        a.download = `${row.empName}_${row.paymentDate}_급여명세서.pdf`;
		        document.body.appendChild(a);
		        a.click();
		        window.URL.revokeObjectURL(url);
		        a.remove();

		    } catch (error) {
		        console.error('PDF 다운로드 중 오류:', error);
		        alert('급여명세서 다운로드 중 오류가 발생했습니다. 관리자에게 문의하세요.');
		    } finally {
		        hideLoadingSpinner();
		    }
		}
		
		// 삭제 버튼
		async function deleteRows() {
		    const checkedRows = grid.getCheckedRows();

		    if (checkedRows.length === 0) {
		        alert('삭제할 항목을 선택해주세요.');
		        return;
		    }

		    const savedRows = checkedRows.filter(row => row.paymentNo);
		    const unsavedRows = checkedRows.filter(row => !row.paymentNo);

		    if (!confirm(`선택한 ${checkedRows.length}건을 삭제하시겠습니까?`)) {
		        return;
		    }

		    try {
		        if (savedRows.length > 0) {
		            const paymentNos = savedRows.map(row => row.paymentNo);
		            
		            // CSRF 토큰 가져오기
		            const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;
		            const csrfToken = document.querySelector('meta[name="_csrf"]').content;
		            
		            const response = await fetch('/api/payroll/pay-info', {
		                method: 'DELETE',
		                headers: {
		                    'Content-Type': 'application/json',
		                    [csrfHeader]: csrfToken  // CSRF 토큰 추가
		                },
		                body: JSON.stringify(paymentNos)
		            });

		            if (!response.ok) {
		                const errorData = await response.json();
		                throw new Error(errorData.message || '삭제 처리 중 오류가 발생했습니다.');
		            }

		            // 성공적으로 삭제된 경우에만 그리드에서 제거
		            savedRows.forEach(row => {
		                grid.removeRow(row.rowKey);
		            });

			        }
		            // 미저장 데이터 그리드에서 제거
		            unsavedRows.forEach(row => {
		                grid.removeRow(row.rowKey);
		            });
					
			            alert('선택한 항목이 삭제되었습니다.');
		    } catch (error) {
		        console.error('Error:', error);
		        alert(error.message);
		    }
		}
		
		// 지급일 설정 및 검증
		function validatePaymentDate(value) {
			// 날짜 형식 정규식 (YYYY-MM 또는 YYYYMM)
			    const dateRegex = /^(\d{4})-?(\d{2})$/;
			    const match = value.match(dateRegex);
			    
			    if (!match) {
			        return null;
			    }
			    
			    const year = parseInt(match[1]);
			    const month = parseInt(match[2]);
			    
			    // 기본 유효성 검사
			    if (year < 2000 || year > 2100 || month < 1 || month > 12) {
			        return null;
			    }
			    
			    // 현재 날짜 가져오기
			    const today = new Date();
			    const currentYear = today.getFullYear();
			    const currentMonth = today.getMonth() + 1; // JavaScript의 월은 0부터 시작
			    
			    // 미래 날짜 체크
			    if (year > currentYear || (year === currentYear && month > currentMonth)) {
			        return null;
			    }
			    
			    // YYYY-MM 형식으로 반환
			    return `${year}-${month.toString().padStart(2, '0')}`;
			}
			
			// 지급월 입력 처리 함수
			function handlePaymentDateInput() {
			    let isValid = false;
			    let formattedDate = null;
			    
			    while (!isValid) {
			        const paymentDate = prompt('지급월을 입력하세요 (예: 2024-01 또는 202401)');
			        
			        if (!paymentDate) {
			            return null; // 취소 버튼을 눌렀을 경우
			        }
			        
			        formattedDate = validatePaymentDate(paymentDate);
			        
			        if (formattedDate) {
			            isValid = true;
			        } else {
			            alert('올바른 지급월이 아니거나 미래의 지급월입니다.\n현재 월까지만 입력 가능합니다.');
			        }
			    }
			    
			    return formattedDate;
			}
			
			async function previewPayslip() {
			    try {
			        const checkedRows = grid.getCheckedRows();
			        if (checkedRows.length === 0) {
			            alert('명세서를 출력할 항목을 선택해주세요.');
			            return;
			        }
			        if (checkedRows.length > 1) {
			            alert('명세서는 한 번에 한 건만 출력할 수 있습니다.');
			            return;
			        }

			        const row = checkedRows[0];
			        if (!row.paymentNo) {
			            alert('저장되지 않은 데이터는 명세서를 출력할 수 없습니다.');
			            return;
			        }

			        // 팝업 창 크기와 위치 설정
			        const width = 900;
			        const height = 800;
			        const left = (window.innerWidth - width) / 2 + window.screenX;
			        const top = (window.innerHeight - height) / 2 + window.screenY;

			        // 새 창으로 열기
					window.open(
			           `/pay-info/payslip-preview/${row.paymentNo}?empName=${encodeURIComponent(row.empName)}`,
			           'PayslipPreview',
			           `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
			       );

			    } catch (error) {
			        console.error('명세서 미리보기 중 오류:', error);
			        alert('급여명세서 미리보기 중 오류가 발생했습니다.');
			    }
			}

					// 숫자 포맷팅 함수
					function formatCurrency(amount) {
					    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
					}

					// 급여 시뮬레이션 함수
					function simulateSalary() {
					    const salaryInput = document.getElementById('simulatedSalary');
					    const baseSalary = salaryInput.value.replace(/[^0-9]/g, '');
					    
					    if (!baseSalary) {
					        alert('급여를 입력해주세요.');
					        return;
					    }

					    // 로딩 표시
					    showLoadingSpinner();
					    
					    fetch('/api/payroll/calculator/simulate/calculate', {
					        method: 'POST',
					        headers: {
					            'Content-Type': 'application/json',
					            [header]: token
					        },
					        body: JSON.stringify({
					            baseSalary: baseSalary
					        })
					    })
					    .then(response => response.json())
					    .then(result => {
					        hideLoadingSpinner();
					        
					        if (result.status === 'success') {
								console.log('Calculation result:', result.data);
					            updateSimulationResult(result.data);
					            document.getElementById('simulationResult').style.display = 'block';
					        } else {
					            alert(result.message);
					        }
					    })
					    .catch(error => {
					        hideLoadingSpinner();
					        console.error('Error:', error);
					        alert('계산 중 오류가 발생했습니다.');
					    });
					}

					// 시뮬레이션 결과 업데이트 함수
					function updateSimulationResult(data) {
						const formatCurrency = (value) => {
							if (value === null || value === undefined || isNaN(value)) {
					            console.warn('Invalid value:', value);  // 디버깅용 로그
					            return '0원';
					        }
					        return new Intl.NumberFormat('ko-KR').format(value) + '원';
					    };
						// 각 항목 업데이트
					    document.getElementById('sim-baseSalary').textContent = formatCurrency(data.baseSalary);
					    document.getElementById('sim-nationalPension').textContent = formatCurrency(data.nationalPension);
					    document.getElementById('sim-healthInsurance').textContent = formatCurrency(data.healthInsurance);
					    document.getElementById('sim-longTermCare').textContent = formatCurrency(data.longTermCare);
					    document.getElementById('sim-employmentInsurance').textContent = formatCurrency(data.employmentInsurance);
					    document.getElementById('sim-incomeTax').textContent = formatCurrency(data.incomeTax);
					    document.getElementById('sim-residentTax').textContent = formatCurrency(data.residentTax);
					    document.getElementById('sim-totalDeductions').textContent = formatCurrency(data.totalDeductions);
					    document.getElementById('sim-netSalary').textContent = formatCurrency(data.netSalary);
					}

					// 기본급 입력 필드에 숫자 포맷팅 이벤트 추가
					document.getElementById('simulatedSalary').addEventListener('input', function(e) {
					    let value = e.target.value.replace(/[^0-9]/g, '');
					    if (value) {
					        e.target.value = new Intl.NumberFormat('ko-KR').format(parseInt(value));
					    }
					});

					// 모달이 닫힐 때 입력값과 결과 초기화
					document.getElementById('salarySimulationModal').addEventListener('hidden.bs.modal', function () {
					    document.getElementById('simulatedSalary').value = '';
					    document.getElementById('simulationResult').style.display = 'none';
					});
					
					// 각 항목 업데이트
					const fields = {
				        'sim-baseSalary': 'baseSalary',
				        'sim-nationalPension': 'nationalPension',
				        'sim-healthInsurance': 'healthInsurance',
				        'sim-longTermCare': 'longTermCare',
				        'sim-employmentInsurance': 'employmentInsurance',
				        'sim-incomeTax': 'incomeTax',
				        'sim-residentTax': 'residentTax',
				        'sim-totalDeductions': 'totalDeductions',
				        'sim-netSalary': 'netSalary'
				    };

				    Object.entries(fields).forEach(([elementId, dataKey]) => {
				        const value = data[dataKey];
				        console.log(`Updating ${elementId} with value:`, value); // 각 필드 업데이트 확인
				        document.getElementById(elementId).textContent = formatCurrency(value);
				    });