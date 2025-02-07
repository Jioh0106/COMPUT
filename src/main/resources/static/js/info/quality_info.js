document.addEventListener('DOMContentLoaded', function() {
	// CSRF 설정
	const header= document.querySelector('meta[name="_csrf_header"]').content;
	const token = document.querySelector('meta[name="_csrf"]').content;

	// Grid 테마 설정
	const Grid = tui.Grid;

	// 상태 관리
	const state = {
		processList: [],
		unitList: [],
		qcGrid: null,
		defectGrid: null,
		isEditMode: false
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
		},

		async put(url, data) {
			try {
				return await $.ajax({
					url,
					type: 'PUT',
					contentType: 'application/json',
					data: JSON.stringify(data),
					beforeSend: xhr => xhr.setRequestHeader(header, token)
				});
			} catch (error) {
				console.error('API 요청 실패:', error);
				throw new Error('데이터 수정에 실패했습니다.');
			}
		},

		async delete(url) {
			try {
				return await $.ajax({
					url,
					type: 'DELETE',
					beforeSend: xhr => xhr.setRequestHeader(header, token)
				});
			} catch (error) {
				console.error('API 요청 실패:', error);
				throw new Error('데이터 삭제에 실패했습니다.');
			}
		}
	};

	// 컬럼 정의
	const columns = {
		// 공정 컬럼
		createProcessColumn() {
			return {
				header: '공정',
				name: 'process',
				width: 120,
				formatter: ({ value }) => {
					const process = state.processList.find(p => p.processNo === Number(value));
					return process?.processName ?? '';
				},
				editor: {
					type: 'select',
					options: {
						listItems: state.processList.map(p => ({
							text: p.processName,
							value: p.processNo
						}))
					}
				},
				validation: { required: true }
			};
		},

		// 단위 컬럼
		createUnitColumn() {
			return {
				header: '단위',
				name: 'unit',
				width: 80,
				align: 'center',
				formatter: ({ value }) => {
					const unit = state.unitList.find(u => u.common_detail_code === value);
					return unit?.common_detail_name ?? '';
				},
				editor: {
					type: 'select',
					options: {
						listItems: state.unitList.map(u => ({
							text: u.common_detail_name,
							value: u.common_detail_code
						}))
					}
				}
			};
		},
		
		// 사용여부 컬럼
		createUseYnColumn() {
			return {
				header: '사용여부',
				name: 'useYn',
				width: 80,
				align: 'center',
				formatter: 'listItemText',
				editor: {
					type: 'select',
					options: {
						listItems: [
							{ text: '사용', value: 'Y' },
							{ text: '미사용', value: 'N' }
						]
					}
				}
			};
		},

		// QC 그리드 컬럼
		getQcColumns() {
			return [
				{
					header: '검사코드',
					name: 'qcCode',
					width: 120,
					align: 'center',
					sortable: true
				},
				{
					header: '검사명',
					name: 'qcName',
					width: 150,
					editor: 'text',
					validation: { required: true }
				},
				this.createProcessColumn(),
				{
					header: '목표값',
					name: 'targetValue',
					width: 100,
					align: 'right',
					editor: {
						type: 'text',
						validation: {
							dataType: 'number',
							required: true
						}
					}
				},
				{
					header: '상한값',
					name: 'ucl',
					width: 100,
					align: 'right',
					editor: {
						type: 'text',
						validation: { dataType: 'number' }
					}
				},
				{
					header: '하한값',
					name: 'lcl',
					width: 100,
					align: 'right',
					editor: {
						type: 'text',
						validation: { dataType: 'number' }
					}
				},
				this.createUnitColumn(),
				{
					header: '검사방법',
					name: 'qcMethod',
					editor: 'text'
				},
				this.createUseYnColumn(),
				{
				    header: '생성일시',
				    name: 'createTime',
				    width: 150,
				    align: 'center',
				    sortable: true,
				    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
				},
				{
				    header: '수정일시',
				    name: 'updateTime',
				    width: 150,
				    align: 'center',
				    sortable: true,
				    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
				}
			];
		},

		// 불량 그리드 컬럼
		getDefectColumns() {
			return [
				{
					header: '불량코드',
					name: 'defectCode',
					width: 120,
					align: 'center',
					sortable: true
				},
				{
					header: '불량명',
					name: 'defectName',
					width: 150,
					editor: 'text',
					validation: { required: true }
				},
				this.createProcessColumn(),
				{
					header: '불량유형',
					name: 'defectType',
					width: 120,
					editor: 'text'
				},
				{
					header: '불량수준',
					name: 'defectLevel',
					width: 100,
					editor: 'text'
				},
				{
					header: '판정기준',
					name: 'judgmentCriteria',
					editor: 'text'
				},
				this.createUseYnColumn(),
				{
					header: '생성일시',
					name: 'createTime',
					width: 150,
					align: 'center',
					sortable: true,
					formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
				},
				{
				    header: '수정일시',
				    name: 'updateTime',
				    width: 150,
				    align: 'center',
				    sortable: true,
				    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
				}
			];
		},
	};

	// 그리드 초기화
	function initializeGrids() {
		const defaultGridOptions = {
			minHeight: '400px',
			rowHeaders: ['checkbox'],
			columnOptions: {
				resizable: true
			}
		};

		state.qcGrid = new Grid({
			el: document.getElementById('qcGrid'),
			...defaultGridOptions,
			columns: columns.getQcColumns()
		});

		state.defectGrid = new Grid({
			el: document.getElementById('defectGrid'),
			...defaultGridOptions,
			columns: columns.getDefectColumns()
		});

		setupGridEvents(state.qcGrid);
		setupGridEvents(state.defectGrid);
	}

	// 그리드 이벤트 설정
	function setupGridEvents(grid) {
		grid.on('beforeChange', (ev) => {
			if (!state.isEditMode) {
				ev.stop();
				alert('수정 모드에서만 데이터를 변경할 수 있습니다.');
			}
		});

		grid.on('check', () => {
			updateButtonState();
		});
	}

	// 공통 데이터 로드
	async function loadCommonData() {
		try {
			const [processList, unitList] = await Promise.all([
				api.get('/api/quality/common/process'),
				api.get('/api/quality/common/unit')
			]);

			state.processList = processList || [];
			state.unitList = unitList || [];

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
			const activeTab = $('.nav-link.active').attr('id').replace('-tab', '');
			const processNo = $('#processNo').val();
			const searchName = $('#searchName').val();
			const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;

			const response = await api.get(`/api/quality/${activeTab}/list`, {
				processNo: processNo || null,
				searchName: searchName || null,
			});

			grid.resetData(response || []);
			grid.refreshLayout();
		} catch (error) {
			alert(error.message);
		}
	}

	// 데이터 검증
	function validateGridData(gridData) {
		const errors = [];

		gridData.forEach((row, index) => {
			if (!row.process) {
				errors.push(`${index + 1}행: 공정은 필수항목입니다.`);
			}

			if (row.qcCode) {
				if (!row.qcName) {
					errors.push(`${index + 1}행: 검사명은 필수항목입니다.`);
				}
				if (!row.targetValue && row.targetValue !== 0) {
					errors.push(`${index + 1}행: 목표값은 필수항목입니다.`);
				}
				if (row.targetValue && (row.ucl || row.lcl)) {
					const target = parseFloat(row.targetValue);
					const ucl = parseFloat(row.ucl);
					const lcl = parseFloat(row.lcl);

					if (ucl && target > ucl) {
						errors.push(`${index + 1}행: 목표값이 상한값보다 클 수 없습니다.`);
					}
					if (lcl && target < lcl) {
						errors.push(`${index + 1}행: 목표값이 하한값보다 작을 수 없습니다.`);
					}
					if (ucl && lcl && ucl < lcl) {
						errors.push(`${index + 1}행: 상한값이 하한값보다 작을 수 없습니다.`);
					}
				}
			} else {
				if (!row.defectName) {
					errors.push(`${index + 1}행: 불량명은 필수항목입니다.`);
				}
			}
		});

		return errors;
	}

	// 새로운 행 추가
	window.addNewRow = function() {
		if (!state.isEditMode) {
			alert('수정 모드에서만 추가할 수 있습니다.');
			return;
		}

		const activeTab = $('.tab-pane.active').attr('id');
		const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;

		const maxNo = grid.getData().reduce((max, row) => {
			const code = activeTab === 'qc' ? row.qcCode : row.defectCode;
			const prefix = activeTab === 'qc' ? 'QC' : 'DF';
			const num = parseInt(code?.replace(prefix, '') || '0', 10);
			return !isNaN(num) && num > max ? num : max;
		}, 0);

		const prefix = activeTab === 'qc' ? 'QC' : 'DF';
		const newCode = `${prefix}${String(maxNo + 1).padStart(3, '0')}`;

		const newRow = {
			[activeTab === 'qc' ? 'qcCode' : 'defectCode']: newCode,
			[activeTab === 'qc' ? 'qcName' : 'defectName']: '',
			process: '',
			useYn: 3.
			,
			createTime: new Date().toISOString(),
			...(activeTab === 'qc' ? {
				targetValue: null,
				ucl: null,
				lcl: null,
				unit: null,
				qcMethod: ''
			} : {
				defectType: '',
				defectLevel: '',
				judgmentCriteria: ''
			})
		};

		grid.prependRow(newRow);
	};

	// 데이터 저장
	window.saveData = async function() {
		if (!state.isEditMode) {
			alert('수정 모드에서만 저장할 수 있습니다.');
			return;
		}

		try {
			const activeTab = $('.nav-link.active').attr('id').replace('-tab', '');
			const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;
			const modifiedRows = grid.getModifiedRows();

			if (modifiedRows.createdRows.length === 0 && modifiedRows.updatedRows.length === 0) {
				alert('저장할 데이터가 없습니다.');
				return;
			}

			// 데이터 검증
			const validationErrors = validateGridData([...modifiedRows.createdRows, ...modifiedRows.updatedRows]);
			if (validationErrors.length > 0) {
				alert(`데이터 검증 실패:\n${validationErrors.join('\n')}`);
				return;
			}

			// 데이터 타입 변환 처리
			const convertRowData = (row) => ({
				...row,
				process: row.process ? Number(row.process) : null,  // 숫자 타입으로 변환
				targetValue: row.targetValue ? Number(row.targetValue) : null,
				ucl: row.ucl ? Number(row.ucl) : null,
				lcl: row.lcl ? Number(row.lcl) : null
			});

			// 데이터 저장
			const savePromises = [
				...modifiedRows.createdRows.map(row =>
					api.post(`/api/quality/${activeTab}`, convertRowData(row))
				),
				...modifiedRows.updatedRows.map(row =>
					api.put(`/api/quality/${activeTab}/update`, convertRowData(row))
				)
			];

			await Promise.all(savePromises);
			alert('저장되었습니다.');
			await loadGridData();
		} catch (error) {
			alert(error.message);
		}
	};

	// 수정 모드 토글
	window.toggleEditMode = function() {
		state.isEditMode = !state.isEditMode;
		const editBtn = document.getElementById('editBtn');

		if (state.isEditMode) {
			editBtn.classList.remove('btn-outline-secondary');
			editBtn.classList.add('btn-secondary');
			editBtn.textContent = '수정 완료';
		} else {
			editBtn.classList.remove('btn-secondary');
			editBtn.classList.add('btn-outline-secondary');
			editBtn.textContent = '수정';

			// 수정 모드 종료 시 변경사항 취소
			const activeTab = $('.nav-link.active').attr('id').replace('-tab', '');
			const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;
			grid.restore();
		}

		// 버튼 상태 업데이트
		updateButtonState();
	};

	// 선택된 행 삭제
	window.deleteSelectedRows = async function() {
		if (!state.isEditMode) {
			alert('수정 모드에서만 삭제할 수 있습니다.');
			return;
		}

		const activeTab = $('.nav-link.active').attr('id').replace('-tab', '');
		const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;
		const checkedRows = grid.getCheckedRows();

		if (checkedRows.length === 0) {
			alert('삭제할 항목을 선택해주세요.');
			return;
		}

		if (!confirm('선택한 항목을 삭제하시겠습니까?')) {
			return;
		}

		try {
			const promises = checkedRows.map(row => {
				const code = activeTab === 'qc' ? row.qcCode : row.defectCode;
				return api.delete(`/api/quality/${activeTab}/${code}`);
			});

			await Promise.all(promises);
			alert('삭제되었습니다.');
			await loadGridData();
		} catch (error) {
			alert(error.message);
		}
	};

	// 그리드 업데이트
	window.updateGrids = _.debounce(() => {
		if (state.qcGrid && state.defectGrid) {
			loadGridData();
		}
	}, 300);

	// 탭 변경 이벤트
	$('#qualityTab button').on('shown.bs.tab', function(e) {
		setTimeout(() => {
			const activeGrid = e.target.id === 'qc-tab' ? state.qcGrid : state.defectGrid;
			if (activeGrid) {
				activeGrid.refreshLayout();
				loadGridData();
			}
		}, 100);
	});

	// 버튼 상태 업데이트
	function updateButtonState() {
		const activeTab = $('.nav-link.active').attr('id').replace('-tab', '');
		const grid = activeTab === 'qc' ? state.qcGrid : state.defectGrid;

		if (!grid) return;

		const checkedRows = grid.getCheckedRows();
		const buttons = {
			delete: document.querySelector('button[onclick="deleteSelectedRows()"]'),
			add: document.querySelector('button[onclick="addNewRow()"]'),
			save: document.querySelector('button[onclick="saveData()"]')
		};

		// 삭제 버튼
		if (buttons.delete) {
			buttons.delete.disabled = !state.isEditMode || checkedRows.length === 0;
		}

		// 추가 버튼
		if (buttons.add) {
			buttons.add.disabled = !state.isEditMode;
		}

		// 저장 버튼
		if (buttons.save) {
			buttons.save.disabled = !state.isEditMode;
		}
	}

	// 초기화
	loadCommonData().catch(error => {
		console.error('초기화 중 오류 발생:', error);
		alert('시스템 초기화 중 오류가 발생했습니다.');
	});
});