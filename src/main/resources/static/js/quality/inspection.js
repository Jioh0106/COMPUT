document.addEventListener('DOMContentLoaded', function() {
	// =============== 상수 정의 ===============
	const CONSTANTS = {
		API: {
			LOTS: '/api/quality/lots',
			ITEMS: '/api/quality/items',
			RESULT: '/api/quality/result',
			LOT_STATUS: '/api/quality/lot/status',
			PROCESS_LIST: '/api/quality/process-list'
		},
		STATUS: {
			WAIT: 'LTST003',      // 검사 대기
			IN_PROGRESS: 'LTST004', // 검사 진행중
			COMPLETE: 'LTST005',    // 검사 완료
			FAIL: 'LTST006'       // 불합격
		},
		MESSAGES: {
			NO_LOT_SELECTED: '검사할 LOT를 선택해주세요.',
			INSPECTION_START: '검사를 시작합니다.',
			INCOMPLETE_MEASUREMENT: '모든 항목의 측정값을 입력해주세요.',
			INVALID_MEASUREMENT: '유효한 숫자를 입력해주세요.',
			INSPECTION_COMPLETE: '검사가 완료되었습니다.',
			DATA_LOAD_ERROR: '데이터를 불러오는데 실패했습니다.',
			DATA_SAVE_ERROR: '데이터 저장에 실패했습니다.'
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

				const contentType = response.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					return await response.json();
				}
				return null;
			} catch (error) {
				console.error('API request failed:', error);
				throw error;
			}
		}

		async get(url, params = {}) {
			let fullUrl = url;
			const queryString = new URLSearchParams(params).toString();
			if (queryString) {
				fullUrl += `?${queryString}`;
			}
			console.log('Requesting URL:', fullUrl);
			return this.request('GET', fullUrl);
		}

		async post(url, data) {
			return this.request('POST', url, data);
		}
	}

	// =============== 그리드 관리자 ===============
	class GridManager {
		constructor() {
			this.initializeGrids();
		}

		initializeGrids() {
			// LOT 그리드 설정
			this.lotGrid = new tui.Grid({
				el: document.getElementById('lotGrid'),
				scrollX: true,
				scrollY: true,
				rowHeaders: ['checkbox'],
				columns: [
					{ header: 'LOT 번호', name: 'lotNo', align: 'center' },
					{ header: '작업지시번호', name: 'wiNo', align: 'center' },
					{ header: '제품명', name: 'productName' },
					{ header: '공정', name: 'processName' },
					{
						header: 'LOT 상태',
						name: 'lotStatus',
						align: 'center',
						formatter: ({ value }) => {
							const statusMap = {
								'LTST003': { text: '검사 대기', color: '#5a6268' },
								'LTST004': { text: '검사 진행중', color: '#0d6efd' }
							};
							const status = statusMap[value] || { text: value, color: '#6c757d' };
							return `<span style="color: ${status.color}; font-weight: bold;">${status.text}</span>`;
						}
					}
				]
			});

			// 검사항목 그리드 설정
			this.inspectionGrid = new tui.Grid({
				el: document.getElementById('inspectionGrid'),
				scrollX: true,
				scrollY: true,
				rowHeaders: ['checkbox'],
				columns: [
					{ header: '검사코드', name: 'qcCode', align: 'center' },
					{ header: '검사명', name: 'qcName' },
					{
						header: '목표값',
						name: 'targetValue',
						align: 'right',
						formatter: this.numberFormatter
					},
					{
						header: '상한값',
						name: 'ucl',
						align: 'right',
						formatter: this.numberFormatter
					},
					{
						header: '하한값',
						name: 'lcl',
						align: 'right',
						formatter: this.numberFormatter
					},
					{ header: '단위', name: 'unitName', align: 'center' },
					{
						header: '측정값',
						name: 'measureValue',
						align: 'right',
						editor: 'text',
						formatter: ({ value, row }) => {
							let formattedValue = value === null || value === undefined ? '' : Number(value).toFixed(2);
							let isOutOfRange = false;

							if (value !== null && value !== undefined) {
								const measureValue = Number(value);
								const ucl = row.ucl ? Number(row.ucl) : null;
								const lcl = row.lcl ? Number(row.lcl) : null;

								if ((ucl !== null && measureValue > ucl) ||
									(lcl !== null && measureValue < lcl)) {
									isOutOfRange = true;
								}
							}

							return isOutOfRange ?
								`<span style="color: #f44336; font-weight: bold;">${formattedValue}</span>` :
								formattedValue;
						}
					}
				]
			});

			// 검사결과 그리드 설정
			this.resultGrid = new tui.Grid({
				el: document.getElementById('inspectionResultGrid'),
				scrollX: true,
				scrollY: true,
				columns: [
					{ header: '검사코드', name: 'qcCode', align: 'center' },
					{ header: '검사명', name: 'qcName' },
					{
						header: '측정값',
						name: 'measureValue',
						align: 'right',
						formatter: this.numberFormatter
					},
					{
						header: '판정',
						name: 'judgement',
						align: 'center',
						formatter: ({ value }) => {
							const result = value === 'Y' ? '합격' : '불합격';
							const color = value === 'Y' ? '#4caf50' : '#f44336';
							return `<span style="color: ${color}; font-weight: bold;">${result}</span>`;
						}
					},
					{ header: '검사자', name: 'inspector', align: 'center' },
					{
						header: '시작시간',
						name: 'checkTime',
						align: 'center',
						formatter: ({ value }) => value ? new Date(value).toLocaleString() : ''
					},
					{
						header: '종료시간',
						name: 'endTime',
						align: 'center',
						formatter: ({ value }) => value ? new Date(value).toLocaleString() : ''
					}
				]
			});
		}

		numberFormatter({ value }) {
			if (value === null || value === undefined || value === '') return '';
			return Number(value).toFixed(2);
		}
	}

	// =============== 메인 컨트롤러 ===============
	class InspectionController {
		constructor() {
			this.api = new ApiService();
			this.gridManager = new GridManager();
			this.state = {
				isInspecting: false,
				selectedLotNo: null,
				selectedLot: null,
				inspectionStartTime: null,
				inspectionEndTime: null
			};
			this.initialize();
		}

		async initialize() {
			try {
				this.setupEventListeners();
				await this.updateGrids();
			} catch (error) {
				console.error('초기화 중 오류 발생:', error);
				alert(CONSTANTS.MESSAGES.DATA_LOAD_ERROR);
			}
		}

		setupEventListeners() {
			// 검색 조건 이벤트
			const lotNoInput = document.getElementById('lotNo');
			const wiNoInput = document.getElementById('wiNo');
			const processNoSelect = document.getElementById('processNo');

			if (lotNoInput) {
				lotNoInput.addEventListener('keyup', _.debounce(() => this.updateGrids(), 300));
			}
			if (wiNoInput) {
				wiNoInput.addEventListener('keyup', _.debounce(() => this.updateGrids(), 300));
			}
			if (processNoSelect) {
				processNoSelect.addEventListener('change', () => this.updateGrids());
			}

			// 그리드 이벤트
			if (this.gridManager.lotGrid) {
				this.gridManager.lotGrid.on('click', (ev) => this.onLotGridClick(ev));
			}
			if (this.gridManager.inspectionGrid) {
				this.gridManager.inspectionGrid.on('afterChange', (ev) => this.onMeasurementChange(ev));
			}
		}

		async onLotGridClick(ev) {
			const cell = ev.targetType === 'cell' ? ev : null;
			if (!cell) return;

			const row = this.gridManager.lotGrid.getRow(ev.rowKey);
			if (!row) return;

			this.state.selectedLotNo = row.lotNo;
			this.state.selectedLot = row;

			// 검사 진행중인 LOT 선택 시 검사 상태 업데이트
			if (row.lotStatus === CONSTANTS.STATUS.IN_PROGRESS) {
				this.state.isInspecting = true;
			}

			try {
				// 검사 항목 로드
				const items = await this.api.get(`${CONSTANTS.API.ITEMS}/${row.lotNo}`);
				console.log('Loaded inspection items:', items);
				this.gridManager.inspectionGrid.resetData(items || []);

				// 검사 결과 로드
				const results = await this.api.get(`${CONSTANTS.API.RESULT}/${row.lotNo}`);
				console.log('Loaded inspection results:', results);
				this.gridManager.resultGrid.resetData(results || []);
			} catch (error) {
				console.error('데이터 로드 실패:', error);
				alert(CONSTANTS.MESSAGES.DATA_LOAD_ERROR);
			}
		}

		validateAndUpdateMeasurement(change) {
			if (!change || change.rowKey === undefined) return;

			const measureValue = parseFloat(change.value);
			if (isNaN(measureValue)) {
				alert(CONSTANTS.MESSAGES.INVALID_MEASUREMENT);
				this.gridManager.inspectionGrid.setValue(change.rowKey, 'measureValue', null);
				this.gridManager.inspectionGrid.setValue(change.rowKey, 'judgement', null);
				return;
			}

			const row = this.gridManager.inspectionGrid.getRow(change.rowKey);
			if (!row) return;

			// 기본값은 합격으로 설정
			let judgement = 'Y';

			// 문자열로 된 값들을 숫자로 변환
			const ucl = row.ucl ? parseFloat(row.ucl) : null;
			const lcl = row.lcl ? parseFloat(row.lcl) : null;

			console.log('Validation values:', {
				measureValue: measureValue,
				ucl: ucl,
				lcl: lcl,
				rawUcl: row.ucl,
				rawLcl: row.lcl
			});

			// 판정 로직
			// UCL과 LCL이 모두 존재하는 경우
			if (lcl !== null && ucl !== null) {
				console.log('Checking range:', `${lcl} <= ${measureValue} <= ${ucl}`);
				if (measureValue < lcl || measureValue > ucl) {
					judgement = 'N';
				}
			}
			// UCL만 존재하는 경우
			else if (ucl !== null && lcl === null) {
				console.log('Checking UCL:', `${measureValue} <= ${ucl}`);
				if (measureValue > ucl) {
					judgement = 'N';
				}
			}
			// LCL만 존재하는 경우
			else if (lcl !== null && ucl === null) {
				console.log('Checking LCL:', `${measureValue} >= ${lcl}`);
				if (measureValue < lcl) {
					judgement = 'N';
				}
			}

			console.log('Final judgement:', {
				measureValue,
				ucl,
				lcl,
				judgement
			});

			this.gridManager.inspectionGrid.setValue(change.rowKey, 'measureValue', measureValue);
			this.gridManager.inspectionGrid.setValue(change.rowKey, 'judgement', judgement);

			// 검사 결과를 결과 그리드에도 반영
			const resultData = {
				lotNo: this.state.selectedLotNo,
				qcCode: row.qcCode,
				qcName: row.qcName,
				targetValue: row.targetValue,
				ucl: row.ucl,
				lcl: row.lcl,
				measureValue: measureValue,
				judgement: judgement,
				inspector: 'SYSTEM',
				checkTime: new Date().toISOString(),
				endTime: null
			};

			const currentResults = this.gridManager.resultGrid.getData();
			const updatedResults = [...currentResults];

			// 이미 존재하는 동일 검사 항목이 있는지 확인
			const existingIndex = updatedResults.findIndex(item => item.qcCode === row.qcCode);
			if (existingIndex !== -1) {
				// 기존 항목 업데이트
				updatedResults[existingIndex] = resultData;
			} else {
				// 새 항목 추가
				updatedResults.push(resultData);
			}

			this.gridManager.resultGrid.resetData(updatedResults);
		}

		onMeasurementChange(ev) {
			if (!this.state.isInspecting) return;

			// ev.changes가 배열인지 확인
			const changes = Array.isArray(ev.changes) ? ev.changes : [ev.changes];

			changes.forEach(change => {
				if (change.columnName === 'measureValue') {
					this.validateAndUpdateMeasurement(change);
				}
			});
		}

		async updateGrids() {
			if (!this.gridManager.lotGrid) return;

			try {
				const params = {
					lotNo: document.getElementById('lotNo')?.value || '',
					wiNo: document.getElementById('wiNo')?.value || '',
					processNo: document.getElementById('processNo')?.value || ''
				};

				const lots = await this.api.get(CONSTANTS.API.LOTS, params);
				console.log('Loaded lots:', lots);

				// LOT 그리드 업데이트
				this.gridManager.lotGrid.resetData(lots || []);

				// 선택된 LOT이 있는 경우 관련 데이터도 함께 로드
				if (this.state.selectedLotNo) {
					const items = await this.api.get(`${CONSTANTS.API.ITEMS}/${this.state.selectedLotNo}`);
					console.log('Loaded items for selected lot:', items);
					this.gridManager.inspectionGrid.resetData(items || []);

					const results = await this.api.get(`${CONSTANTS.API.RESULT}/${this.state.selectedLotNo}`);
					console.log('Loaded results for selected lot:', results);
					this.gridManager.resultGrid.resetData(results || []);
				} else {
					// 선택된 LOT이 없는 경우 나머지 그리드 초기화
					this.gridManager.inspectionGrid.clear();
					this.gridManager.resultGrid.clear();
				}
			} catch (error) {
				console.error('그리드 데이터 로드 실패:', error);
				alert(CONSTANTS.MESSAGES.DATA_LOAD_ERROR);
			}
		}

		async startInspection() {
			const checkedRows = this.gridManager.lotGrid.getCheckedRows();

			if (checkedRows.length === 0) {
				alert(CONSTANTS.MESSAGES.NO_LOT_SELECTED);
				return;
			}

			const selectedRow = checkedRows[0];
			if (selectedRow.lotStatus !== CONSTANTS.STATUS.WAIT) {
				alert('검사 대기 상태의 LOT만 검사를 시작할 수 있습니다.');
				return;
			}

			try {
				const currentTime = new Date();
				this.state.inspectionStartTime = new Date().toISOString();

				await this.api.post(CONSTANTS.API.LOT_STATUS, {
					lotNo: selectedRow.lotNo,
					lotStatus: CONSTANTS.STATUS.IN_PROGRESS
				});

				this.state.isInspecting = true;
				this.state.selectedLotNo = selectedRow.lotNo;
				this.state.selectedLot = selectedRow;

				// 검사 항목 자동 로드
				const items = await this.api.get(`${CONSTANTS.API.ITEMS}/${selectedRow.lotNo}`);
				this.gridManager.inspectionGrid.resetData(items || []);
				this.gridManager.resultGrid.clear();

				await this.updateGrids();
				alert(CONSTANTS.MESSAGES.INSPECTION_START);
			} catch (error) {
				console.error('검사 시작 중 오류:', error);
				alert('검사 시작 중 오류가 발생했습니다.');
			}
		}

		async saveInspection() {
			if (!this.state.isInspecting) {
				alert('검사가 시작되지 않았습니다.');
				return;
			}

			try {
				const inspectionData = this.gridManager.inspectionGrid.getData();

				if (inspectionData.some(item =>
					item.measureValue === null ||
					item.measureValue === undefined ||
					item.measureValue === ''
				)) {
					alert(CONSTANTS.MESSAGES.INCOMPLETE_MEASUREMENT);
					return;
				}

				// 검사 종료 시간 저장
				const currentTime = new Date();
				this.state.inspectionEndTime = new Date().toISOString();


				const results = inspectionData.map(item => ({
					lotNo: this.state.selectedLotNo,
					qcCode: item.qcCode,
					qcName: item.qcName,
					targetValue: item.targetValue,
					ucl: item.ucl,
					lcl: item.lcl,
					processNo: this.state.selectedLot.processNo,
					measureValue: item.measureValue !== null ? Number(item.measureValue) : null,
					judgement: item.judgement || null,
					inspector: 'SYSTEM',
					checkTime: this.state.inspectionStartTime,
					endTime: this.state.inspectionEndTime
				}));

				console.log('Sending inspection results:', results);
				await this.api.post(CONSTANTS.API.RESULT, results);

				alert(CONSTANTS.MESSAGES.INSPECTION_COMPLETE);
				this.state.isInspecting = false;
				this.state.selectedLot = null;
				this.state.inspectionStartTime = null;
				this.state.inspectionEndTime = null;

				await this.updateGrids();
			} catch (error) {
				console.error('검사결과 저장 실패:', error);
				alert('검사결과 저장 중 오류가 발생했습니다: ' + error.message);
			}
		}
	}

	// 전역 객체 초기화
	const controller = new InspectionController();
	window.startInspection = () => controller.startInspection();
	window.saveInspection = () => controller.saveInspection();
	window.updateGrids = () => controller.updateGrids();
});