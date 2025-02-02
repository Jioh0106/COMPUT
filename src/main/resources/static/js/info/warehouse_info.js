$(function() {    
    // 사용자 권한에 따른 수정 가능 여부 설정
    // ATHR001, ATHR002 권한을 가진 사용자만 수정 가능
    const isEditable = role === 'ATHR001' || role === 'ATHR002';
    
    // CSRF 토큰 가져오기 - API 요청 시 보안을 위해 사용
    const csrfToken = $('meta[name="_csrf"]').attr('content');

    // 창고 ID 기준 내림차순 정렬
	const data = warehouseList.sort((a, b) => {
	        const numA = parseInt(a.warehouse_id.replace('WH', ''));
	        const numB = parseInt(b.warehouse_id.replace('WH', ''));
	        return numB - numA;  // 내림차순 정렬
	});

    // 모든 컬럼에 공통적으로 적용될 기본 속성 정의
    const defaultColumnProps = {
        align: 'center',     
        sortable: true,      
        editor: false        
    };

    // 그리드 컬럼 정의
    const columns = [
        { header: '창고 ID', name: 'warehouse_id', width: 100 },
        { header: '창고명', name: 'warehouse_name', width: 150, editor: isEditable ? 'text' : false },
        { 
            header: '창고유형', 
            name: 'warehouse_type', 
            width: 100,
            // 권한이 있는 경우에만 선택 가능한 드롭다운 에디터 제공
            editor: isEditable ? {
                type: 'select',
                options: {
                    listItems: [
                        { text: '완제품', value: '완제품' },
                        { text: '원자재', value: '원자재' }
                    ]
                }
            } : false 
        },
        { header: '위치', name: 'location', width: 300, editor: isEditable ? 'text' : false },
        { header: '구역', name: 'zone', width: 180 },
        { header: '관리자', name: 'manager', width: 100, editor: isEditable ? 'text' : false },
        { 
            header: '상태', 
            name: 'status', 
            width: 100,
            // 권한이 있는 경우에만 선택 가능한 드롭다운 에디터 제공
            editor: isEditable ? {
                type: 'select',
                options: {
                    listItems: [
                        { text: '사용', value: '사용' },
                        { text: '미사용', value: '미사용' }
                    ]
                }
            } : false 
        }
    ].map(col => ({ ...defaultColumnProps, ...col }));  // 각 컬럼에 기본 속성 적용

    // Toast UI Grid 인스턴스 생성
    let grid = new tui.Grid({
        el: document.getElementById('grid'),
        data,
        rowHeaders: ['checkbox'],  
        columns
    });

    // 구역 체크박스 HTML 생성 함수
    function createZoneCheckbox(zoneId) {
        return `
            <div style="display: inline-block; margin: 10px;">
                <input type="checkbox" id="zone${zoneId}" value="${zoneId}" checked>
                <label for="zone${zoneId}">${zoneId}구역</label>
            </div>`;
    }

    // 구역 모달 초기화 함수
    function initializeZoneModal(currentZones) {
        const zoneCheckboxes = document.querySelector('.swal2-content #zoneCheckboxes');
        if (!zoneCheckboxes) return;
        
        // 현재 선택된 구역들에 대한 체크박스 생성
        zoneCheckboxes.innerHTML = currentZones
            .map(zone => zone.trim())
            .filter(Boolean)
            .map(createZoneCheckbox)
            .join('');
    }

    // 새로운 구역 추가 함수
    function addNewZone() {
        const newZoneInput = document.querySelector('.swal2-content #newZone');
        const zoneCheckboxes = document.querySelector('.swal2-content #zoneCheckboxes');
        if (!newZoneInput || !zoneCheckboxes) return;
        
        const newZone = newZoneInput.value.trim().toUpperCase();
        
        // 구역명 유효성 검사
        if (!newZone) {
            return Swal.showValidationMessage('구역명을 입력해주세요');
        }
        
        // 영문자와 숫자만 허용
        if (!/^[A-Z0-9]+$/.test(newZone)) {
            return Swal.showValidationMessage('구역명은 영문 대문자와 숫자만 가능합니다');
        }
        
        // 중복 구역 체크
        if (document.querySelector(`.swal2-content #zone${newZone}`)) {
            return Swal.showValidationMessage('이미 존재하는 구역입니다');
        }
        
        // 새로운 구역 체크박스 추가
        zoneCheckboxes.insertAdjacentHTML('beforeend', createZoneCheckbox(newZone));
        newZoneInput.value = '';
    }

    // 그리드 클릭 이벤트 핸들러
    grid.on('click', async (ev) => {
        // 구역 컬럼 클릭 시 구역 선택 모달 표시
        if (ev.columnName === 'zone' && isEditable) {
            const row = grid.getRow(ev.rowKey);
            // 현재 선택된 구역 목록 가져오기
            const currentZones = row.zone ? row.zone.split(',').map(z => z.trim()).filter(z => z) : [];
            
            // SweetAlert2를 사용한 모달 창 표시
            const { value: result } = await Swal.fire({
                title: '창고 구역 선택',
                html: document.getElementById('zoneModal').innerHTML,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                // 모달이 열릴 때 실행되는 콜백
                didOpen: () => {
                    initializeZoneModal(currentZones);
                    const addZoneBtn = document.querySelector('.swal2-content #addZoneBtn');
                    const newZoneInput = document.querySelector('.swal2-content #newZone');
                    
                    // 구역 추가 버튼 클릭 이벤트
                    addZoneBtn?.addEventListener('click', addNewZone);
                    // Enter 키 입력 이벤트
                    newZoneInput?.addEventListener('keypress', e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewZone();
                        }
                    });
                },
                // 모달이 닫힐 때 이벤트 리스너 제거
                willClose: () => {
                    document.querySelector('.swal2-content #addZoneBtn')
                        ?.removeEventListener('click', addNewZone);
                },
                // 확인 버튼 클릭 시 실행되는 콜백
                preConfirm: () => {
                    // 선택된 구역들 가져오기
                    const selectedZones = Array.from(
                        document.querySelectorAll('.swal2-content input[type="checkbox"]')
                    )
                        .filter(cb => cb.checked)
                        .map(cb => cb.value)
                        .sort();
                        
                    // 최소 1개 이상의 구역이 선택되어야 함
                    if (!selectedZones.length) {
                        Swal.showValidationMessage('최소 하나의 구역을 선택해주세요');
                        return false;
                    }
                    return selectedZones.join(',');
                }
            });

            // 선택된 구역 정보를 그리드에 반영
            if (result) {
                grid.setValue(ev.rowKey, 'zone', result);
            }
        }
    });

    // 행 추가 버튼 클릭 이벤트
    $('#append').on('click', e => {
        e.preventDefault();
        // 현재 최대 창고 ID 번호 찾기
        const maxNo = grid.getData().reduce((max, row) => {
            const num = parseInt(row.warehouse_id?.replace('WH', '') || '0', 10);
            return !isNaN(num) && num > max ? num : max;
        }, 0);

        // 새로운 행 추가
        grid.prependRow({
            warehouse_id: `WH${String(maxNo + 1).padStart(3, '0')}`,  // 다음 번호로 ID 생성
            warehouse_name: '',
            warehouse_type: '',
            location: '',
            zone: '',
            manager: '',
            status: '미사용',
            reg_date: new Date().toISOString().split('T')[0]  // 현재 날짜
        }, { focus: true });  // 추가 후 포커스
    });

    // 저장 버튼 클릭 이벤트
    $('#save').on('click', async () => {
        // 변경된 데이터 가져오기
        const modifiedRows = grid.getModifiedRows();
        
        // 변경된 데이터가 없는 경우
        if (!modifiedRows.updatedRows.length && !modifiedRows.createdRows.length) {
            return Swal.fire('', '수정 또는 추가된 데이터가 없습니다.', 'info');
        }

        // 필수 항목 검증
        const invalidRows = [...modifiedRows.createdRows, ...modifiedRows.updatedRows]
            .some(row => !row.warehouse_name || !row.warehouse_type || !row.location || !row.manager);

        if (invalidRows) {
            return Swal.fire({
                icon: '오류',
                title: '필수 항목을 모두 입력하세요',
                text: '창고명, 창고유형, 위치, 관리자는 필수 항목입니다.'
            });
        }

        // API 호출하여 데이터 저장
        const response = await axios.post('/api/warehouse/save', {
            updatedRows: modifiedRows.updatedRows,
            createdRows: modifiedRows.createdRows.map(row => ({
                ...row,
                // 구역 정보 변환
                zones: row.zone.split(',').map(zoneId => ({
                    zone_id: zoneId.trim(),
                    zone_name: `${zoneId.trim()}구역`
                }))
            }))
        }, {
            headers: { 'X-CSRF-TOKEN': csrfToken }
        });

        await Swal.fire('성공', '데이터가 성공적으로 저장되었습니다.', 'success');
        
        // 저장된 데이터로 그리드 갱신
		const sortedData = response.data.sort((a, b) => {
		    const numA = parseInt(a.warehouse_id.replace('WH', ''));
		    const numB = parseInt(b.warehouse_id.replace('WH', ''));
		    return numB - numA;
		});
		grid.resetData(sortedData);
	});

    // 삭제 버튼 클릭 이벤트
    $('#delete').on('click', async () => {
        const selectedRows = grid.getCheckedRows();
        if (!selectedRows.length) {
            return Swal.fire({
                icon: "warning",
                title: "삭제할 항목을 선택하세요."
            });
        }

        // 삭제 확인 모달
        const { isConfirmed } = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "이 작업은 되돌릴 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });

        // 확인 시 삭제 처리
        if (isConfirmed) {
            await axios.post('/api/warehouse/delete', 
                selectedRows.map(row => row.warehouse_id),
                { headers: { 'X-CSRF-TOKEN': csrfToken } }
            );
            
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: '삭제가 완료되었습니다.',
                showConfirmButton: true,
                timer: 1500
            });
            
            window.location.reload();
        }
    });
});