document.addEventListener('DOMContentLoaded', function() {
    // CSRF 설정
    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const token = document.querySelector('meta[name="_csrf"]').content;

    // 상태 관리
    const state = {
        processList: [],
        lotStatusList: [],
        lotGrid: null,
        lotTraceGrid: null,
        isEditMode: false
    };

    // API 요청 함수
    const api = {
        async getLots(params) {
            try {
                const queryString = new URLSearchParams(params).toString();
                const response = await fetch(`/api/lot/list?${queryString}`, {
                    method: 'GET',
                    headers: {
                        [header]: token
                    }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error('Error fetching lots:', error);
                throw error;
            }
        },

        async saveLot(data) {
            try {
                const response = await fetch('/api/lot/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [header]: token
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Save operation failed');
                return await response.json();
            } catch (error) {
                console.error('Error saving lot:', error);
                throw error;
            }
        }
    };

    // LOT 그리드 컬럼 정의
    const lotColumns = [
        {
            header: 'LOT번호',
            name: 'lotNo',
            sortable: true
        },
        {
            header: '상위LOT',
            name: 'parentLotNo',
        },
        {
            header: '공정유형',
            name: 'processType',
        },
        {
            header: '제품번호',
            name: 'productNo',
        },
        {
            header: 'LOT상태',
            name: 'lotStatus',
            editor: {
                type: 'select',
                options: {
                    listItems: [
                        {text: '진행중', value: 'PROGRESS'},
                        {text: '완료', value: 'COMPLETE'},
                        {text: '폐기', value: 'DISCARD'}
                    ]
                }
            }
        },
        {
            header: '계획수량',
            name: 'planQty',
            editor: 'text'
        },
        {
            header: '현재수량',
            name: 'currQty',
        },
        {
            header: '시작시간',
            name: 'startTime',
            formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
        }
    ];

    // 그리드 초기화
    const initializeGrids = () => {
        const Grid = tui.Grid;

        state.lotGrid = new Grid({
            el: document.getElementById('lotGrid'),
            columns: lotColumns,
            minHeight: '500px',
            rowHeaders: ['checkbox'],
            columnOptions: {
                resizable: true
            }
        });

        setupGridEvents(state.lotGrid);
    };

    // 데이터 로드 함수
    const loadInitialData = async () => {
        try {
            const data = await api.getLots({});
            state.lotGrid.resetData(data);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    };

    // 초기화 실행
    initializeGrids();
    loadInitialData();
});
