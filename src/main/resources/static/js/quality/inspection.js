document.addEventListener('DOMContentLoaded', function() {
    // CSRF 설정
    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const token = document.querySelector('meta[name="_csrf"]').content;

    // Grid 테마 설정
    const Grid = tui.Grid;
    Grid.applyTheme('striped');

    // 상태 관리
    const state = {
        processList: [],
        lotGrid: null,
        inspectionGrid: null,
        selectedLotNo: null,
        isInspecting: false
    };

    // API 요청 헬퍼
    const api = {
        async get(url, params = {}) {
            try {
                const response = await $.ajax({
                    url,
                    type: 'GET',
                    data: params,
                    beforeSend: xhr => xhr.setRequestHeader(header, token)
                });
                return response;
            } catch (error) {
                console.error('API 요청 실패:', error);
                throw new Error('데이터를 불러오는데 실패했습니다.');
            }
        },

        async post(url, data) {
            try {
                return await $.ajax({
                    url,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    beforeSend: xhr => xhr.setRequestHeader(header, token)
                });
            } catch (error) {
                console.error('API 요청 실패:', error);
                throw new Error('데이터 저장에 실패했습니다.');
            }
        }
    };

	// 그리드 컬럼 정의
	const columns = {
	    // LOT 그리드 컬럼
	    getLotColumns() {
	        return [
	            {
	                header: 'LOT 번호',
	                name: 'lotNo',
	                width: 120,
	                align: 'center'
	            },
	            {
	                header: '작업지시번호',
	                name: 'wiNo',
	                width: 120,
	                align: 'center'
	            },
	            {
	                header: '제품명',
	                name: 'productName',
	                width: 200
	            },
	            {
	                header: '공정',
	                name: 'processName',
	                width: 120
	            },
	            {
	                header: 'LOT 상태',
	                name: 'lotStatus',
	                width: 100,
	                align: 'center',
	                formatter: ({value}) => {
	                    const statusMap = {
	                        'LTST002': '진행중',
	                        'LTST003': '검사대기',
	                        'LTST004': '검사완료',
	                        'LTST005': '불합격'
	                    };
	                    return statusMap[value] || value;
	                }
	            },
	            {
	                header: '생성시간',
	                name: 'createTime',
	                width: 150,
	                align: 'center',
	                formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
	            }
	        ];
	    },

	    // 검사항목 그리드 컬럼
	    getInspectionColumns() {
	        return [
	            {
	                header: '검사코드',
	                name: 'qcCode',
	                width: 100,
	                align: 'center'
	            },
	            {
	                header: '검사명',
	                name: 'qcName',
	                width: 200
	            },
	            {
	                header: '목표값',
	                name: 'targetValue',
	                width: 100,
	                align: 'right',
	                formatter: ({value}) => value ? value.toFixed(2) : ''
	            },
	            {
	                header: '상한값',
	                name: 'ucl',
	                width: 100,
	                align: 'right',
	                formatter: ({value}) => value ? value.toFixed(2) : ''
	            },
	            {
	                header: '하한값',
	                name: 'lcl',
	                width: 100,
	                align: 'right',
	                formatter: ({value}) => value ? value.toFixed(2) : ''
	            },
	            {
	                header: '단위',
	                name: 'unit',
	                width: 80,
	                align: 'center'
	            },
	            {
	                header: '측정값',
	                name: 'measureValue',
	                width: 100,
	                align: 'right',
	                editor: 'text',
	                formatter: ({value}) => value ? value.toFixed(2) : ''
	            },
	            {
	                header: '판정',
	                name: 'judgment',
	                width: 80,
	                align: 'center',
	                formatter: ({value}) => {
	                    if (!value) return '';
	                    return value === 'Y' ? '합격' : '불합격';
	                }
	            }
	        ];
	    }
	};

	// 그리드 초기화 수정
	function initializeGrids() {
	    // LOT 그리드
	    state.lotGrid = new Grid({
	        el: document.getElementById('lotGrid'),
	        columns: columns.getLotColumns(),
	        minHeight: '300px',
	        scrollX: true,
	        scrollY: true
	    });

	    // 검사항목 그리드
	    state.inspectionGrid = new Grid({
	        el: document.getElementById('inspectionGrid'),
	        columns: columns.getInspectionColumns(),
	        minHeight: '300px',
	        scrollX: true,
	        scrollY: true
	    });

	    setupGridEvents();
	}

    // 그리드 이벤트 설정
    function setupGridEvents() {
        state.lotGrid.on('click', async (ev) => {
            if (ev.rowKey === undefined) return;
            
            const row = state.lotGrid.getRow(ev.rowKey);
            state.selectedLotNo = row.lotNo;
            
            try {
                const items = await api.get(`/api/quality/inspection/items/${row.lotNo}`);
                state.inspectionGrid.resetData(items);
            } catch (error) {
                alert(error.message);
            }
        });

        state.inspectionGrid.on('afterChange', (ev) => {
            if (!state.isInspecting) return;
            
            // 측정값 입력 시 자동 판정
            const {rowKey, columnName, value} = ev.changes[0];
            if (columnName === 'measureValue') {
                const row = state.inspectionGrid.getRow(rowKey);
                let judgment = 'Y';
                
                if (row.ucl !== null && value > row.ucl) judgment = 'N';
                if (row.lcl !== null && value < row.lcl) judgment = 'N';
                
                state.inspectionGrid.setValue(rowKey, 'judgment', judgment);
            }
        });
    }

    // 공통 데이터 로드
    async function loadCommonData() {
        try {
            const processList = await api.get('/api/quality/common/process');
            state.processList = processList || [];
            initializeProcessSelect();
            initializeGrids();
            await loadGridData();
        } catch (error) {
            console.error('초기 데이터 로드 실패:', error);
            alert(error.message);
        }
    }

    // 공정 선택 드롭다운 초기화
    function initializeProcessSelect() {
        const processSelect = $('#processNo');
        processSelect.empty().append('<option value="">전체</option>');
        state.processList.forEach(process => {
            processSelect.append(`<option value="${process.processNo}">${process.processName}</option>`);
        });
    }

    // 그리드 데이터 로드
    async function loadGridData() {
        try {
            const params = {
                lotNo: $('#lotNo').val(),
                wiNo: $('#wiNo').val(),
                processNo: $('#processNo').val() || null
            };

            const lots = await api.get('/api/quality/inspection/lots', params);
            state.lotGrid.resetData(lots || []);
            state.inspectionGrid.clear();
        } catch (error) {
            alert(error.message);
        }
    }

    // 검사 시작
    window.startInspection = async function() {
        if (!state.selectedLotNo) {
            alert('검사할 LOT를 선택해주세요.');
            return;
        }

        state.isInspecting = true;
        state.inspectionGrid.setColumns(columns.getInspectionColumns());
        alert('검사를 시작합니다.');
    };

	// 검사 완료
	    window.saveInspection = async function() {
	        if (!state.isInspecting) {
	            alert('검사가 시작되지 않았습니다.');
	            return;
	        }

	        try {
	            const inspectionData = state.inspectionGrid.getData();
	            
	            // 모든 항목이 측정되었는지 확인
	            const incompleteMeasurement = inspectionData.some(item => !item.measureValue);
	            if (incompleteMeasurement) {
	                alert('모든 항목의 측정값을 입력해주세요.');
	                return;
	            }

	            // 검사결과 데이터 구성
	            const results = inspectionData.map(item => ({
	                lotNo: state.selectedLotNo,
	                qcCode: item.qcCode,
	                measureValue: item.measureValue,
	                judgment: item.judgment,
	                inspector: 'SYSTEM' // TODO: 실제 로그인 사용자 정보로 대체 필요
	            }));

	            // 검사결과 저장
	            const response = await api.post('/api/quality/inspection/result', results);
	            
	            if (response) {
	                alert('검사가 완료되었습니다.');
	                state.isInspecting = false;
	                state.inspectionGrid.setColumns(columns.getInspectionColumns());
	                await loadGridData();
	            }
	        } catch (error) {
	            alert('검사결과 저장 중 오류가 발생했습니다.');
	            console.error('검사결과 저장 실패:', error);
	        }
	    };

	    // 그리드 업데이트
	    window.updateGrids = _.debounce(() => {
	        if (state.lotGrid) {
	            loadGridData();
	        }
	    }, 300);

	    // 초기화
	    loadCommonData().catch(error => {
	        console.error('초기화 중 오류 발생:', error);
	        alert('시스템 초기화 중 오류가 발생했습니다.');
	    });
	});