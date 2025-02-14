document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const token = document.querySelector('meta[name="_csrf"]').content;

    const Grid = tui.Grid;
    Grid.applyTheme('striped');

    const state = {
        processList: [],
        unitList: [],
        productList: [],
        qcGrid: null,
        qcProductGrid: null,
        selectedQcCode: null,
        isEditMode: false
    };

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

    const columns = {
        createProcessColumn() {
            return {
                header: '공정',
                name: 'process',
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

        createUnitColumn() {
            return {
                header: '단위',
                name: 'unit',
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

        createUseYnColumn() {
            return {
                header: '사용여부',
                name: 'useYn',
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

        getQcColumns() {
            return [
                {
                    header: '검사코드',
                    name: 'qcCode',
                    align: 'center',
                    sortable: true
                },
                {
                    header: '검사명',
                    name: 'qcName',
                    editor: 'text',
                    validation: { required: true }
                },
                this.createProcessColumn(),
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
                    align: 'center',
                    sortable: true,
                    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
                },
                {
                    header: '수정일시',
                    name: 'updateTime',
                    align: 'center',
                    sortable: true,
                    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
                }
            ];
        },
		
		createProductColumn() {
	        return {
	            header: '제품명',
	            name: 'product_no',
	            width: 150,
	            align: 'center',
	            formatter: ({ value }) => {
	                const product = state.productList.find(p => p.product_no === Number(value));
	                return product?.product_name ?? '';
	            },
	            editor: {
	                type: 'select',
	                options: {
	                    listItems: state.productList.map(p => ({
	                        text: p.product_name,
	                        value: p.product_no
	                    }))
	                }
	            },
	            validation: { required: true }
	        };
	    },

        getQcProductColumns() {
            return [
                {
                    header: '검사코드',
                    name: 'qcCode',
                    align: 'center',
                    sortable: true,
                },
                this.createProductColumn(),
                {
                    header: '목표값',
                    name: 'targetValue',
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
                    align: 'right',
                    editor: {
                        type: 'text',
                        validation: { dataType: 'number' }
                    }
                },
                {
                    header: '하한값',
                    name: 'lcl',
                    align: 'right',
                    editor: {
                        type: 'text',
                        validation: { dataType: 'number' }
                    }
                },
                columns.createUseYnColumn(),
				{
                    header: '생성일시',
                    name: 'createTime',
                    align: 'center',
                    sortable: true,
                    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
                },
                {
                    header: '수정일시',
                    name: 'updateTime',
                    align: 'center',
                    sortable: true,
                    formatter: ({value}) => value ? new Date(value).toLocaleString() : ''
                }
            ];
        }
    };

    function initializeGrids() {
        const defaultGridOptions = {
            rowHeaders: ['checkbox'],
            columnOptions: { resizable: true }
        };

        state.qcGrid = new Grid({
            el: document.getElementById('qcGrid'),
            ...defaultGridOptions,
            columns: columns.getQcColumns()
        });

		state.qcProductGrid = new Grid({
		    el: document.getElementById('qcProductGrid'),
		    ...defaultGridOptions,
		    columns: columns.getQcProductColumns(),
		    disabled: state.selectedQcUseYn === 'N'
		});

		state.qcGrid.on('click', async (ev) => {
		    if (ev.columnName === 'qcCode') {
		        const rowData = state.qcGrid.getRow(ev.rowKey);
		        if (!rowData) {
		            console.error('Could not find row data for rowKey:', ev.rowKey);
		            return;
		        }
		        
		        state.selectedQcCode = rowData.qcCode;
		        state.selectedQcUseYn = rowData.useYn;
		        
		        try {
		            await loadQcProductData(rowData.qcCode);
		            
		            // 버튼 상태 업데이트
		            updateButtonState(rowData.useYn);
		        } catch (error) {
		            console.error('Error loading product data:', error);
		            alert('상품별 기준 데이터를 불러오는 중 오류가 발생했습니다.');
		        }
		    }
		});
		
		function updateButtonState(useYn) {
		    const addBtn = document.querySelector('button[onclick="addNewRow(\'qcProduct\')"]');
		    const saveBtn = document.getElementById('saveBtn');
		    const deleteBtn = document.getElementById('deleteBtn');
		    
		    if (useYn === 'N') {
		        // 미사용인 경우 버튼 비활성화
		        addBtn.disabled = true;
		        saveBtn.disabled = true;
		        deleteBtn.disabled = true;
		    } else {
		        // 사용중인 경우 버튼 활성화
		        addBtn.disabled = false;
		        saveBtn.disabled = false;
		        deleteBtn.disabled = false;
		    }
		}
		
		state.lastFocusedGrid = state.qcGrid;
		    
	    state.qcGrid.on('focusChange', () => {
	        state.lastFocusedGrid = state.qcGrid;
	    });
	    
	    state.qcProductGrid.on('focusChange', () => {
	        state.lastFocusedGrid = state.qcProductGrid;
	    });
    }

    async function loadCommonData() {
        try {
            const [processList, unitList, productList] = await Promise.all([
                api.get('/api/quality/common/process'),
                api.get('/api/quality/common/unit'),
                api.get('/api/quality/product/list')
            ]);

            state.processList = processList || [];
            state.unitList = unitList || [];
            state.productList = productList || [];

            initializeGrids();
            await loadQcData();
        } catch (error) {
            console.error('초기 데이터 로드 실패:', error);
            alert(error.message);
        }
    }

    async function loadQcData() {
        try {
            const response = await api.get('/api/quality/qc/list');
            state.qcGrid.resetData(response || []);
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadQcProductData(qcCode) {
        try {
            const response = await api.get(`/api/quality/qc/${qcCode}/products`);
            state.qcProductGrid.resetData(response || []);
		} catch (error) {
	        console.error('Error loading product data:', error);
	        alert(error.message);
	    }
    }
	
	window.updateGrids = function() {
	    const processNo = document.getElementById('processNo').value;
	    const searchName = document.getElementById('searchName').value.trim().toLowerCase();

	    api.get('/api/quality/qc/list').then(response => {
	        if (!response) return;

	        const filteredData = response.filter(item => {
	            const processMatch = !processNo || 
	                (item.process && item.process.toString() === processNo);

	            const nameMatch = !searchName || 
	                (item.qcName && item.qcName.toLowerCase().includes(searchName)) ||
	                (item.qcCode && item.qcCode.toLowerCase().includes(searchName));

	            return processMatch && nameMatch;
	        });

	        state.qcGrid.resetData(filteredData);

	        if (state.qcProductGrid) {
	            state.qcProductGrid.clear();
	            state.selectedQcCode = null;
	        }
	    }).catch(error => {
	        console.error('Error fetching QC data:', error);
	        alert('데이터를 불러오는 중 오류가 발생했습니다.');
	    });

	    const processSelect = document.getElementById('processNo');
	    if (processSelect.options.length <= 1) {
	        state.processList.forEach(process => {
	            const option = document.createElement('option');
	            option.value = process.processNo;
	            option.textContent = process.processName;
	            processSelect.appendChild(option);
	        });
	    }
	};

	async function loadCommonData() {
	    try {
	        const [processList, unitList, productList] = await Promise.all([
	            api.get('/api/quality/common/process'),
	            api.get('/api/quality/common/unit'),
	            api.get('/api/quality/product/list')
	        ]);

	        state.processList = processList || [];
	        state.unitList = unitList || [];
	        state.productList = productList || [];

	        const processSelect = document.getElementById('processNo');
	        processList.forEach(process => {
	            const option = document.createElement('option');
	            option.value = process.processNo;
	            option.textContent = process.processName;
	            processSelect.appendChild(option);
	        });

	        initializeGrids();
	        await loadQcData();
	    } catch (error) {
	        console.error('초기 데이터 로드 실패:', error);
	        alert(error.message);
	    }
	}

	window.addNewRow = function(type) {
	    const grid = type === 'qc' ? state.qcGrid : state.qcProductGrid;

	    if (type === 'qcProduct' && !state.selectedQcCode) {
	        alert('먼저 QC 기준을 선택해주세요.');
	        return;
	    }

	    let newQcCode = 'QC001';

	    if (type === 'qc') {
	        // 최대 값 찾기
	        const existingCodes = grid.getData().map(row => row.qcCode);
	        const maxCode = existingCodes
	            .filter(code => /^QC\d+$/.test(code))
	            .map(code => parseInt(code.replace('QC', ''), 10))
	            .reduce((max, num) => Math.max(max, num), 0);

	        newQcCode = `QC${String(maxCode + 1).padStart(3, '0')}`;
	    }

	    const newRow = type === 'qc' 
	        ? {
	            qcCode: newQcCode,
	            qcName: '',
	            process: '',
	            useYn: '',
	        }
	        : {
	            qcCode: state.selectedQcCode,
	            useYn: 'Y',
	            product_no: '',
	            targetValue: null,
	            ucl: null,
	            lcl: null
	        };

	    grid.prependRow(newRow);
	};
	
	


	window.saveData = async function() {
	    try {
	        const qcModifiedRows = state.qcGrid.getModifiedRows();
	        const productModifiedRows = state.qcProductGrid.getModifiedRows();

	        // 상위 그리드(QC 마스터) 저장이 있을 경우
	        if (qcModifiedRows.createdRows.length > 0 || qcModifiedRows.updatedRows.length > 0) {
	            // 새로 생성된 QC 코드 임시 저장
	            const newQcCodes = qcModifiedRows.createdRows.map(row => row.qcCode);
	            
	            // QC 마스터 데이터 저장
	            const saveQcPromises = [
	                ...qcModifiedRows.createdRows.map(row =>
	                    api.post('/api/quality/qc', {
	                        ...row,
	                        process: row.process ? Number(row.process) : null
	                    })
	                ),
	                ...qcModifiedRows.updatedRows.map(row =>
	                    api.put('/api/quality/qc/update', {
	                        ...row,
	                        process: row.process ? Number(row.process) : null
	                    })
	                )
	            ];
	            await Promise.all(saveQcPromises);

	            // 새로 생성된 QC에 대한 제품별 기준이 있는지 확인
	            if (newQcCodes.includes(state.selectedQcCode)) {
	                // 제품별 QC 기준 저장이 있을 경우에만 실행
	                if (productModifiedRows.createdRows.length > 0 || productModifiedRows.updatedRows.length > 0) {
	                    const saveProductPromises = [
	                        ...productModifiedRows.createdRows.map(row =>
	                            api.post('/api/quality/qc/product', {
	                                ...row,
	                                targetValue: row.targetValue ? Number(row.targetValue) : null,
	                                ucl: row.ucl ? Number(row.ucl) : null,
	                                lcl: row.lcl ? Number(row.lcl) : null
	                            })
	                        ),
	                        ...productModifiedRows.updatedRows.map(row =>
	                            api.put('/api/quality/qc/product/update', {
	                                ...row,
	                                targetValue: row.targetValue ? Number(row.targetValue) : null,
	                                ucl: row.ucl ? Number(row.ucl) : null,
	                                lcl: row.lcl ? Number(row.lcl) : null
	                            })
	                        )
	                    ];
	                    await Promise.all(saveProductPromises);
	                }
	            }
	        }
	        // QC 마스터 저장이 없고 제품별 기준 저장만 있는 경우
	        else if (productModifiedRows.createdRows.length > 0 || productModifiedRows.updatedRows.length > 0) {
	            const saveProductPromises = [
	                ...productModifiedRows.createdRows.map(row =>
	                    api.post('/api/quality/qc/product', {
	                        ...row,
	                        targetValue: row.targetValue ? Number(row.targetValue) : null,
	                        ucl: row.ucl ? Number(row.ucl) : null,
	                        lcl: row.lcl ? Number(row.lcl) : null
	                    })
	                ),
	                ...productModifiedRows.updatedRows.map(row =>
	                    api.put('/api/quality/qc/product/update', {
	                        ...row,
	                        targetValue: row.targetValue ? Number(row.targetValue) : null,
	                        ucl: row.ucl ? Number(row.ucl) : null,
	                        lcl: row.lcl ? Number(row.lcl) : null
	                    })
	                )
	            ];
	            await Promise.all(saveProductPromises);
	        }

	        alert('저장되었습니다.');
	        await loadQcData();
	        if (state.selectedQcCode) {
	            await loadQcProductData(state.selectedQcCode);
	        }
	    } catch (error) {
	        alert(error.message);
	    }
	};

	window.deleteSelectedRows = async function() {
	    const qcCheckedRows = state.qcGrid.getCheckedRows();
	    const productCheckedRows = state.qcProductGrid.getCheckedRows();
	    
	    let activeGrid, type, checkedRows;
	    
	    if (qcCheckedRows.length > 0) {
	        activeGrid = state.qcGrid;
	        type = 'qc';
	        checkedRows = qcCheckedRows;
	    } else if (productCheckedRows.length > 0) {
	        if (state.selectedQcUseYn === 'N') {
	            alert('미사용으로 설정된 QC의 제품별 기준은 삭제할 수 없습니다.');
	            return;
	        }
	        activeGrid = state.qcProductGrid;
	        type = 'qc/product';
	        checkedRows = productCheckedRows;
	    } else {
	        alert('삭제할 항목을 선택해주세요.');
	        return;
	    }

	    if (!confirm('선택한 항목을 삭제하시겠습니까?')) {
	        return;
	    }

	    try {
	        const promises = checkedRows.map(row => {
	            if (type === 'qc') {
	                return api.delete(`/api/quality/qc/${row.qcCode}`);
	            } else {
	                return api.delete(`/api/quality/qc/product/${row.mappingId}`);
	            }
	        });

	        await Promise.all(promises);
	        alert('삭제되었습니다.');
	        
	        if (type === 'qc') {
	            await loadQcData();
	            state.qcProductGrid.clear();
	            state.selectedQcCode = null;
	        } else if (state.selectedQcCode) {
	            await loadQcProductData(state.selectedQcCode);
	        }
	    } catch (error) {
	        console.error('Delete operation failed:', error);
	        alert('삭제 중 오류가 발생했습니다: ' + error.message);
	    }
	};

    loadCommonData().catch(error => {
        console.error('초기화 중 오류 발생:', error);
        alert('시스템 초기화 중 오류가 발생했습니다.');
    });
});