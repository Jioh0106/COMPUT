// CSRF 설정
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// 전역 변수
let tooltipEl = null;

// Grid 초기화 및 설정
const grid = new tui.Grid({
    el: document.getElementById('grid'),
    data: formulas,
    rowHeaders: ['checkbox'],
    columns: [
        { 
            header: '구분',
            name: 'formulaType',
            sortable: true,
            sortingType: 'asc',
            formatter: function(value) {
                switch(value.value) {
                    case 'DDCT': return '공제';
                    case 'RWRD': return '수당';
                    default: return value.value;
                }
            }
        },
        { 
            header: '항목명', 
            name: 'formulaName'
        },
        {
            header: '설명',
            name: 'formulaComment',
            formatter: function(value) {
                return value.value ? '<span class="custom-text">자세히보기</span>' : '';
            }
        },
        { 
            header: '적용년도',
            name: 'applyYear',
            sortable: true
        },
        {
            header: '우선순위',
            name: 'formulaPriority',
            sortable: true
        },
        { 
            header: '수정일시', 
            name: 'updatedAt',
            sortable: true,
            formatter: value => value.value ? new Date(value.value).toLocaleString() : ''
        }
    ]
});

// 툴팁 관련 함수
function showTooltip(event, comment) {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add('custom-tooltip');
        document.body.appendChild(tooltipEl);
    }

    tooltipEl.innerText = comment;
    
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const posX = event.pageX + 10;
    const posY = event.pageY + 10;
    
    tooltipEl.style.left = Math.min(posX, window.innerWidth - tooltipRect.width - 10) + 'px';
    tooltipEl.style.top = Math.min(posY, window.innerHeight - tooltipRect.height - 10) + 'px';
}

function hideTooltip() {
    if (tooltipEl) {
        tooltipEl.remove();
        tooltipEl = null;
    }
}

// Grid 이벤트 리스너
grid.on('mouseover', function(event) {
    if (event.columnName === 'formulaComment' && event.targetType === 'cell') {
        const rowData = grid.getRow(event.rowKey);
        showTooltip(event.nativeEvent, rowData.formulaComment);
    }
});

grid.on('mouseout', function(event) {
    if (event.columnName === 'formulaComment' && event.targetType === 'cell') {
        hideTooltip();
    }
});

// 필터 이벤트 리스너
document.querySelectorAll('input[name="typeFilter"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const selectedType = this.value;
        let filteredData = formulas;
        
        if (selectedType) {
            const typeMap = {
                '공제': 'DDCT',
                '수당': 'RWRD'
            };
            filteredData = formulas.filter(formula => formula.formulaType === typeMap[selectedType]);
        }
        
        grid.resetData(filteredData);
    });
});

// 구분 선택 이벤트
document.getElementById('typeSelect').addEventListener('change', async function() {
    const formulaCodeSelect = document.getElementById('formulaCode');
    formulaCodeSelect.disabled = !this.value;
    formulaCodeSelect.innerHTML = '<option value="">선택하세요</option>';
    
    if (this.value) {
        try {
            const response = await fetch('/pay-mng/formula-types', {
                headers: {
                    [csrfHeader]: csrfToken
                }
            });
            const data = await response.json();
            
            const filteredData = data.filter(item => item.type === this.value);
            filteredData.forEach(item => {
                const option = new Option(item.name, item.code);
                option.dataset.type = item.type;
                formulaCodeSelect.add(option);
            });
        } catch (error) {
            console.error('항목 데이터 로딩 중 오류:', error);
            alert('항목 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }
});

// 폼 제출 이벤트
document.getElementById('salaryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        formulaId: this.dataset.id,
        formulaCode: document.getElementById('formulaCode').value,
        formulaType: document.getElementById('formulaType').value,
        formulaName: document.getElementById('formulaCode').options[
            document.getElementById('formulaCode').selectedIndex
        ].text,
        formulaContent: document.getElementById('formulaContent').value,
        formulaComment: document.getElementById('formulaComment').value,
        applyYear: parseInt(document.getElementById('applyYear').value),
        formulaPriority: parseInt(document.getElementById('formulaPriority').value)
    };

    try {
        const url = formData.formulaId ? '/pay-mng/update' : '/pay-mng';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message || '저장되었습니다.');
            location.reload();
        } else {
            throw new Error(result.message || '저장 중 오류가 발생했습니다');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});

// 수정 버튼 이벤트
document.getElementById('editBtn').addEventListener('click', async function() {
    const checkedRows = grid.getCheckedRows();
    if (checkedRows.length !== 1) {
        alert('수정할 항목을 하나만 선택해주세요.');
        return;
    }
    
    const selectedRow = checkedRows[0];
    const displayType = selectedRow.formulaType === 'DDCT' ? '공제' : '수당';
    
    // 폼 필드 설정
    document.getElementById('typeSelect').value = displayType;
    await loadFormulaTypes(displayType, selectedRow.formulaCode);
    
    document.getElementById('formulaType').value = selectedRow.formulaType;
    document.getElementById('formulaContent').value = selectedRow.formulaContent;
    document.getElementById('formulaComment').value = selectedRow.formulaComment;
    document.getElementById('applyYear').value = selectedRow.applyYear;
    document.getElementById('formulaPriority').value = selectedRow.formulaPriority;

    // 모달 설정
    document.getElementById('salaryForm').dataset.id = selectedRow.formulaId;
    document.querySelector('.modal-title').textContent = '급여 항목 수정';
    new bootstrap.Modal(document.getElementById('salaryModal')).show();
});

// 삭제 버튼 이벤트
document.getElementById('deleteBtn').addEventListener('click', async function() {
    const checkedRows = grid.getCheckedRows();
    if(checkedRows.length === 0) {
        alert('삭제할 항목을 선택해주세요.');
        return;
    }
    
    if(!confirm('선택한 항목을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const ids = checkedRows.map(row => row.formulaId);
        const response = await fetch('/pay-mng/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(ids)
        });
        
        const result = await response.json();
        if (response.ok) {
            alert(result.message || '삭제되었습니다.');
            location.reload();
        } else {
            throw new Error(result.message || '삭제 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});

// 모달 관련 이벤트
document.getElementById('salaryModal').addEventListener('hidden.bs.modal', function () {
    const form = document.getElementById('salaryForm');
    form.reset();
    delete form.dataset.id;
    document.querySelector('.modal-title').textContent = '급여 항목 입력';
    document.getElementById('formulaCode').disabled = true;
});

// 권한 체크 및 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeYearSelect();
    
    if (!hasAdminRole) {
        const adminButtons = ['editBtn', 'deleteBtn'];
        adminButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.style.display = 'none';
            }
        });
        
        grid.setColumnValues('_checked', false);
        grid.hideColumn('_checked');
    }
});

// 유틸리티 함수들
function initializeYearSelect() {
    const yearSelect = document.getElementById('applyYear');
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="">선택하세요</option>';
    
    for(let i = currentYear; i <= currentYear + 2; i++) {
        const option = new Option(i + '년', i);
        yearSelect.add(option);
    }
}

async function loadFormulaTypes(type, selectedCode = null) {
    const formulaCodeSelect = document.getElementById('formulaCode');
    formulaCodeSelect.disabled = false;
    formulaCodeSelect.innerHTML = '<option value="">선택하세요</option>';
    
    try {
        const response = await fetch('/pay-mng/formula-types', {
            headers: {
                [csrfHeader]: csrfToken
            }
        });
        const data = await response.json();
        
        data.filter(item => item.type === type)
            .forEach(item => {
                const option = new Option(item.name, item.code);
                formulaCodeSelect.add(option);
            });
            
        if (selectedCode) {
            formulaCodeSelect.value = selectedCode;
        }
    } catch (error) {
        console.error('Formula types loading error:', error);
        alert('데이터 로딩 중 오류가 발생했습니다.');
    }
}