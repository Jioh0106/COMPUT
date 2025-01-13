// toast ui grid
const Grid = tui.Grid;
Grid.applyTheme('clean'); // 테마 적용
const empInfoList = new Grid({
	el: document.getElementById('grid'),
	  data: [], // 초기 데이터
	  bodyHeight: 200,
	  columns: [
	    { header: '사원번호', name: 'EMP_ID'},
	    { header: '이름', name: 'EMP_NAME'},
	    { header: '부서명', name: 'EMP_DEPT_NAME'},
	    { header: '직급명', name: 'EMP_POSITION_NAME'},
	    { header: 'E-mail', name: 'EMP_EMAIL'}
	  ],
	  columnOptions: {
	          resizable: true
	        }
});

// 카테고리 전환
const categoryMenu = document.getElementById("categoryMenu");
const empChartContainer = document.getElementById("empChartContainer");
let  hrLineChart,hrGroupBarChart,hrJobTypePieChart,hrRankPieChart;

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", initChart);

categoryMenu.addEventListener("input",() => {
	const selectCategory = categoryMenu.value;
	console.log(selectCategory);
	
	if(selectCategory === "입/퇴사자"){
		empChartContainer.innerHTML="<div id='lineChart'></div>";
		countMonthlyHireExit();
	}else if(selectCategory === "부서/직급별"){
		empChartContainer.innerHTML="<div id='groupBarChart'></div>";
		//countDeptByPosition();
	}else if(selectCategory === "고용유형별"){
		empChartContainer.innerHTML="<div id='jobTypePieChart'></div>";
		countByJobType();
	}else if(selectCategory === "성과등급별"){
		empChartContainer.innerHTML = "<div id='rankPieChart'></div>";
		countByRank();
	}
});

// 초기 메뉴에 따라 차트 생성
function initChart(){
	const defaultCategory = categoryMenu.value;
	
	if(defaultCategory === "입/퇴사자"){
		empChartContainer.innerHTML="<div id='lineChart'></div>";
		countMonthlyHireExit();
	}else if(defaultCategory === "부서/직급별"){
		empChartContainer.innerHTML="<div id='groupBarChart'></div>";
		//countDeptByPosition();
	}else if(defaultCategory === "고용유형별"){
		empChartContainer.innerHTML="<div id='jobTypePieChart'></div>";
		//countByJobType();
	}else if(defaultCategory === "성과등급별"){
		empChartContainer.innerHTML = "<div id='rankPieChart'></div>";
		//countByRank();
	}
}

// toast ui chart
function createLineChart(/*data*/) {
    hrLineChart = toastui.Chart.lineChart({
        el: document.getElementById('lineChart'),
        data: {
            categories: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'], //data.months, // ['1월', '2월', ..., '12월']
            series: [
                { name: '입사', 
				  data: [3,1,4,8,9,5,7,1,0,2,13,9]//data.joinCounts 
			    }, // 월별 입사자 수
                { name: '퇴사', 
				  data: [1,3,5,6,5,7,4,3,0,1,1,3]//data.leaveCounts 
			  	} // 월별 퇴사자 수
            ]
        },
        options: {
            chart: { title: '월별 입/퇴사자', width: 800, height: 550 },
            xAxis: { title: '월' },
            yAxis: { title: '인원 수' },
            series: { spline: true } // 부드러운 선
        }
    });
}

function createGroupBarChart(groupBarChartData){
	hrGroupBarChart = toastui.Chart.barChart({
		el : document.getElementById('groupBarChart'), 
		data : groupBarChartData,
		options : {
			chart: { title: '연령별 인원 현황', width: 800, height: 550 },
	      	yAxis: { title: 'Age Group', align: 'center', },
	      	series: { stack: false, diverging: true },
		}
	});
}

function createJobTypePieChart(pieChartData){
	hrJobTypePieChart = new toastui.Chart.pieChart({
		el : document.getElementById("jobTypePieChart"),
		data : pieChartData,
	 	options : {
		   	chart: { 
				title: "학력별 사원 현황", 
				width: 850, 
				height: 400,
			},
			series: {
	         	radiusRange: {inner: '40%', outer: '100%'},
	          	angleRange: {start: -90, end: 90},
	          	dataLabels: {
					visible: true, 
					pieSeriesName: {visible: true, anchor: 'outer'}}
	        },
		 },
	});
}

function createRankPieChart(pieChartData){
	hrJobTypePieChart = new toastui.Chart.pieChart({
		el : document.getElementById("rankPieChart"),
		data : pieChartData,
	 	options : {
		   	chart: { 
				title: "학력별 사원 현황", 
				width: 850, 
				height: 400,
			},
			series: {
	         	radiusRange: {inner: '40%', outer: '100%'},
	          	angleRange: {start: -90, end: 90},
	          	dataLabels: {
					visible: true, 
					pieSeriesName: {visible: true, anchor: 'outer'}}
	        },
		 },
	});
}

// ajax
async function countMonthlyHireExit(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-monthlyHireExit");
		createLineChart();
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("hireExit",result);
		
		/*
		const pieChartData = {
			categories: ["학력"],
		    series: result.map(item => ({
				name: item.EMP_EDU,
				data: item.EMP_COUNT_EDU
			}))
		};
		*/
		
		// 차트 생성 및 데이터 설정
		
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByMonthlyHireExit(hireExitArray){
	try{
		if (eduArray.length === 0) {
	           console.log("차트라벨을 선택하지 않았습니다.(pieChart)");
	           empInfoList.resetData([]);
	           return;
	       }
		   
  	 	const param = new URLSearchParams();
 		hireExitArray.forEach(item => param.append("hireExit",item)); 
		  
		const response = await fetch(`http://localhost:8082/api/infoList-by-monthlyHireExit?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		// 차트 생성 및 데이터 설정
		
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}

async function countDeptByPosition(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-dept-and-position");
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("position",result);
		
		/*
		const pieChartData = {
			categories: ["학력"],
		    series: result.map(item => ({
				name: item.EMP_EDU,
				data: item.EMP_COUNT_EDU
			}))
		};
		*/
		
		// 차트 생성 및 데이터 설정
		//createGroupBarChart();
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}
async function deptInfoListByPosition(positionArray){
	try{
		if (eduArray.length === 0) {
	           console.log("차트라벨을 선택하지 않았습니다.(pieChart)");
	           empInfoList.resetData([]);
	           return;
	       }
		   
	   	const param = new URLSearchParams();
  		positionArray.forEach(item => param.append("position",item));
  		   
  		const response = await fetch(`http://localhost:8082/api/infoList-by-dept-and-position?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		// 차트 생성 및 데이터 설정
		
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}

async function countByJobType(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-jobType");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("jobType",result);
		
		/*
		const pieChartData = {
			categories: ["학력"],
		    series: result.map(item => ({
				name: item.EMP_EDU,
				data: item.EMP_COUNT_EDU
			}))
		};
		*/
		
		
		// 차트 생성 및 데이터 설정
		//createJobTypePieChart();
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByJobType(jobTypeArray){
	try{
		if (eduArray.length === 0) {
	           console.log("차트라벨을 선택하지 않았습니다.(pieChart)");
	           empInfoList.resetData([]);
	           return;
	       }
		   
	   	const param = new URLSearchParams();
   		jobTypeArray.forEach(item => param.append("jobType",item));
   		   
   		const response = await fetch(`http://localhost:8082/api/infoList-by-jobType?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		// 차트 생성 및 데이터 설정
		
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}

async function countByRank(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-rank");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("rank",result);
		
		/*
		const pieChartData = {
			categories: ["학력"],
		    series: result.map(item => ({
				name: item.EMP_EDU,
				data: item.EMP_COUNT_EDU
			}))
		};
		*/
		
		// 차트 생성 및 데이터 설정
		//createRankPieChart();
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByRank(rankArray){
	try{
		if (eduArray.length === 0) {
	           console.log("차트라벨을 선택하지 않았습니다.(pieChart)");
	           empInfoList.resetData([]);
	           return;
	       }
		
  	 	const param = new URLSearchParams();
		rankArray.forEach(item => param.append("rank",item));
		   
		const response = await fetch(`http://localhost:8082/api/infoList-by-rank?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		// 차트 생성 및 데이터 설정
		
		// 초기 값 정보 조회
		
		/*
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
		});
		*/
		
	}catch(error){
		console.error(error);
	}
}

