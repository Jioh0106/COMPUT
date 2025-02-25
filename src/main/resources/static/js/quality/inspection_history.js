document.addEventListener('DOMContentLoaded', function() {
    // =============== 상수 정의 ===============
    const CONSTANTS = {
        API: {
            HISTORY: '/api/quality/history',
            STATS: '/api/quality/stats'
        },
        MESSAGES: {
            DATA_LOAD_ERROR: '데이터를 불러오는데 실패했습니다.'
        }
    };
	
    // =============== API 서비스 ===============
    class ApiService {
        async request(method, url, data = null) {
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;
            const csrfToken = document.querySelector('meta[name="_csrf"]').content;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    },
                    body: data ? JSON.stringify(data) : null
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        }

        async get(url, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            return this.request('GET', `${url}${queryString ? `?${queryString}` : ''}`);
        }
    }

    // =============== 그리드 ===============
    class GridManager {
		constructor() {
	        this.initializeGrids();
	    }

		initializeGrids() {
		    // 검사 이력 그리드 설정
		    const historyGridEl = document.getElementById('historyGrid');
		    if (!historyGridEl) {
		        console.error('historyGrid element not found');
		        return;
		    }

		    try {
		        this.historyGrid = new tui.Grid({
		            el: historyGridEl,
		            scrollX: true,
		            scrollY: true,
		            width: 'auto',
		            columns: [
		                { header: 'LOT 번호', name: 'lotNo', align: 'center' },
		                { header: '공정', name: 'processName', width: 100},
//		                { header: '검사코드', name: 'qcCode', align: 'center' },
		                { header: '검사명', name: 'qcName'},
		                { 
		                    header: '목표값', 
		                    name: 'targetValue', 
		                    align: 'right',
							width: 60,
		                    formatter: this.numberFormatter
		                },
		                { 
		                    header: '상한값', 
		                    name: 'ucl', 
		                    align: 'right',
							width: 60,
		                    formatter: this.numberFormatter
		                },
		                { 
		                    header: '하한값', 
		                    name: 'lcl', 
		                    align: 'right',
							width: 60,
		                    formatter: this.numberFormatter
		                },
		                { 
		                    header: '측정값', 
		                    name: 'measureValue', 
		                    align: 'right',
							width: 60,
		                    formatter: ({value, row}) => {
		                        let formattedValue = this.numberFormatter({value});
		                        if (!value) return formattedValue;

		                        const measureValue = Number(value);
		                        const ucl = row.ucl ? Number(row.ucl) : null;
		                        const lcl = row.lcl ? Number(row.lcl) : null;
		                        
		                        const isOutOfRange = 
		                            (ucl !== null && measureValue > ucl) || 
		                            (lcl !== null && measureValue < lcl);
		                        
		                        return isOutOfRange ? 
		                            `<span style="color: #f44336; font-weight: bold;">${formattedValue}</span>` : 
		                            formattedValue;
		                    }
		                },
		                { 
		                    header: '판정', 
		                    name: 'judgement', 
		                    align: 'center',
							width: 60,
		                    formatter: ({ value }) => {
		                        const result = value === 'Y' ? '합격' : '불합격';
		                        const color = value === 'Y' ? '#4caf50' : '#f44336';
		                        return `<span style="color: ${color}; font-weight: bold;">${result}</span>`;
		                    }
		                },
		                { header: '검사자', name: 'inspector', align: 'center' },
		                { 
		                    header: '검사시간', 
		                    name: 'checkTime', 
		                    align: 'center',
		                    formatter: ({ value }) => value ? new Date(value).toLocaleString() : ''
		                }
		            ]
		        });

		        // 공정별 통계 그리드 설정
		        const processStatsGridEl = document.getElementById('processStatsGrid');
		        if (!processStatsGridEl) {
		            console.error('processStatsGrid element not found');
		            return;
		        }

		        this.processStatsGrid = new tui.Grid({
		            el: processStatsGridEl,
		            scrollX: true,
		            scrollY: true,
		            width: 'auto',
		            columns: [
		                { header: '공정', name: 'processName'},
		                { 
		                    header: '전체 검사', 
		                    name: 'totalCount', 
		                    align: 'right',
		                    formatter: ({value}) => value.toLocaleString()
		                },
		                { 
		                    header: '합격', 
		                    name: 'passCount', 
		                    align: 'right',
		                    formatter: ({value}) => value.toLocaleString()
		                },
		                { 
		                    header: '합격률', 
		                    name: 'passRate', 
		                    align: 'right',
		                    formatter: ({value}) => {
		                        return `<span style="color: #4caf50;">${value.toFixed(1)}%</span>`;
		                    }
		                },
		                { 
		                    header: '불합격', 
		                    name: 'failCount', 
		                    align: 'right',
		                    formatter: ({value}) => value.toLocaleString()
		                },
		                { 
		                    header: '불합격률', 
		                    name: 'failRate', 
		                    align: 'right',
		                    formatter: ({value}) => {
		                        return `<span style="color: #f44336;">${value.toFixed(1)}%</span>`;
		                    }
		                }
		            ]
		        });

		        // 두 그리드 모두 레이아웃 리프레시
		        this.historyGrid.refreshLayout();
		        this.processStatsGrid.refreshLayout();
		        
		        console.log('그리드 초기화 성공');
		    } catch (error) {
		        console.error('그리드 초기화 실패:', error);
		    }
			
			setTimeout(() => {
	            this.historyGrid.refreshLayout();
	            this.processStatsGrid.refreshLayout();
	        }, 0);
		}

        numberFormatter({ value }) {
            if (value === null || value === undefined || value === '') return '';
            return Number(value).toFixed(2);
        }
    }

    // =============== 메인 컨트롤러 ===============
    class HistoryController {
        constructor() {
            this.api = new ApiService();
            this.gridManager = new GridManager();
			this.currentJudgement = '';
            this.initialize();
        }

		async initialize() {
		        try {
		            this.initializeDatePickers();
		            document.getElementById('processStatsGrid').style.display = 'none';
					
					['totalStats', 'passStats', 'failStats'].forEach(id => {
		                document.getElementById(id).addEventListener('click', () => {
		                    this.filterByJudgement(id === 'totalStats' ? '' : id === 'passStats' ? 'Y' : 'N');
		                });
		            });
					
		            await this.searchHistory();
		        } catch (error) {
		            console.error('초기화 중 오류 발생:', error);
		            alert(CONSTANTS.MESSAGES.DATA_LOAD_ERROR);
		        }
		    }
			
			filterByJudgement(judgement) {
			    ['totalStats', 'passStats', 'failStats'].forEach(id => {
			        document.getElementById(id).classList.remove('active');
			    });

			    const cardId = judgement === '' ? 'totalStats' : 
			                  judgement === 'Y' ? 'passStats' : 'failStats';
			    document.getElementById(cardId).classList.add('active');

			    this.currentJudgement = judgement;
			    this.searchHistory();
			}

			initializeDatePickers() {
				const datePickerOptions = {
			        language: 'ko',
			        date: new Date(),
			        type: 'date',
			        input: {
						element: '#fromDate',
			            format: 'yyyy-MM-dd'
			        },
			        showAlways: false,
			        autoClose: true,
			        selectableRanges: [
			            [new Date(1900, 0, 1), new Date()]
			        ],
					usageStatistics: false,
			        className: 'custom-datepicker'
			    };
				
	            // 시작일 데이트피커 (1달 전부터 시작)
	            this.fromDatePicker = new tui.DatePicker('#fromDatepicker-container', {
	                ...datePickerOptions,
	                date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
	                input: {
	                    element: '#fromDate',
	                    format: 'yyyy-MM-dd'
	                }
	            });

	            // 종료일 데이트피커 (현재 날짜)
	            this.toDatePicker = new tui.DatePicker('#toDatepicker-container', {
	                ...datePickerOptions,
	                input: {
	                    element: '#toDate',
	                    format: 'yyyy-MM-dd'
	                }
	            });

	            // 추가: 데이트피커 컨테이너 위치 조정
	            const fromDatepickerContainer = document.getElementById('fromDatepicker-container');
	            const toDatepickerContainer = document.getElementById('toDatepicker-container');
	            
	            if (fromDatepickerContainer) {
	                fromDatepickerContainer.style.position = 'absolute';
	                fromDatepickerContainer.style.zIndex = '9999';
	                fromDatepickerContainer.style.marginTop = '5px';
	            }

	            if (toDatepickerContainer) {
	                toDatepickerContainer.style.position = 'absolute';
	                toDatepickerContainer.style.zIndex = '9999';
	                toDatepickerContainer.style.marginTop = '5px';
	            }
	        }

        async searchHistory() {
            try {
                const params = {
                    lotNo: document.getElementById('lotNo').value,
                    fromDate: document.getElementById('fromDate').value,
                    toDate: document.getElementById('toDate').value,
                    processNo: document.getElementById('processNo').value,
                    judgement: this.currentJudgement
                };
                
                // 이력 데이터 조회
                const history = await this.api.get(CONSTANTS.API.HISTORY, params);
                this.gridManager.historyGrid.resetData(history || []);

                // 통계 데이터 조회
                const stats = await this.api.get(CONSTANTS.API.STATS, {
                    fromDate: params.fromDate,
                    toDate: params.toDate,
                    processNo: params.processNo
                });

                this.updateStats(stats);
            } catch (error) {
                console.error('검사 이력 조회 실패:', error);
                alert(CONSTANTS.MESSAGES.DATA_LOAD_ERROR);
            }
        }

        updateStats(stats) {
            // 요약 통계 업데이트
            document.getElementById('totalCount').textContent = stats.totalCount.toLocaleString();
            document.getElementById('passCount').textContent = stats.passCount.toLocaleString();
            document.getElementById('failCount').textContent = stats.failCount.toLocaleString();
            document.getElementById('passRate').textContent = stats.passRate.toFixed(1);
            document.getElementById('failRate').textContent = stats.failRate.toFixed(1);

            // 통계 섹션 표시
            document.getElementById('statsSection').style.display = 'block';
            
            // 공정별 통계 그리드 업데이트
			if (stats.processStats && stats.processStats.length > 0) {
		        document.getElementById('processStatsGrid').style.display = 'block';
		        this.gridManager.processStatsGrid.resetData(stats.processStats);
		        this.gridManager.processStatsGrid.refreshLayout();
		    } else {
		        document.getElementById('processStatsGrid').style.display = 'none';
		    }
        }
    }

    // 전역 객체 초기화
    const controller = new HistoryController();
	controller.initializeDatePickers();
    window.searchHistory = () => controller.searchHistory();
	window.filterByJudgement = (judgement) => controller.filterByJudgement(judgement);
});