// toast ui grid
const Grid = tui.Grid;
Grid.applyTheme('clean'); // 테마 적용
const empInfoList = new Grid({
	el: document.getElementById('grid'),
	  data: [], // 초기 데이터
	  bodyHeight: 260,
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
	
	if(selectCategory === "입/퇴사"){
		empChartContainer.innerHTML="<div id='lineChart'></div>";
		countMonthlyHireExit();
	}else if(selectCategory === "고용유형별"){
		empChartContainer.innerHTML="<div id='jobTypePieChart'></div>";
		countByJobType();
	}else if(selectCategory === "성과등급별"){
		empChartContainer.innerHTML = "<div id='rankPieChart'></div>";
		countByRank();
	}else if(selectCategory === "부서/직급별"){
		empChartContainer.innerHTML="<div id='groupBarChart'></div>";
		//countDeptByPosition();
	}
});

// 초기 메뉴에 따라 차트 생성
function initChart(){
	const defaultCategory = categoryMenu.value;
	
	if(defaultCategory === "입/퇴사"){
		empChartContainer.innerHTML="<div id='lineChart'></div>";
		countMonthlyHireExit();
	}else if(defaultCategory === "고용유형별"){
		empChartContainer.innerHTML="<div id='jobTypePieChart'></div>";
		countByJobType();
	}else if(defaultCategory === "성과등급별"){
		empChartContainer.innerHTML = "<div id='rankPieChart'></div>";
		countByRank();
	}else if(defaultCategory === "부서/직급별"){
		empChartContainer.innerHTML="<div id='groupBarChart'></div>";
		//countDeptByPosition();
	}
}

// toast ui chart
function createLineChart(lineChartData) {
    hrLineChart = toastui.Chart.lineChart({
        el: document.getElementById('lineChart'),
        data: lineChartData,
        options: {
            chart: { title: '월별 입/퇴사 현황', width: 800, height: 550 },
            xAxis: { title: '월' },
            yAxis: { title: '인원 수' },
            series: { spline: true } // 부드러운 선
        }
    });
}
function createJobTypePieChart(pieChartData){
	hrJobTypePieChart = new toastui.Chart.pieChart({
		el : document.getElementById("jobTypePieChart"),
		data : pieChartData,
	 	options : {
		   	chart: { 
				title: "고용 유형별 사원 현황", 
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
	hrRankPieChart = new toastui.Chart.pieChart({
		el : document.getElementById("rankPieChart"),
		data : pieChartData,
	 	options : {
		   	chart: { 
				title: "성과별 사원 현황", 
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

// ajax
async function countMonthlyHireExit(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-monthlyHireExit");
		
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("hireExit",result);
		
		// 데이터 설정
		const monthData = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
		
		const hireData = monthData.map(monthData => {
		   	const match = result.find(item => item.MONTH === monthData);
		   	return match ? match.HIRE_COUNT : 0;
        });
		
		console.log("hireData :",hireData);
		
		const exitData = monthData.map(monthData => {
            const match = result.find(item => item.MONTH === monthData);
            return match ? match.EXIT_COUNT : 0;
        });
		console.log("exitData :",exitData);
		
		const lineChartData = {
			categories : monthData,
			series :[
				{name: "입사", data:hireData},
				{name: "퇴사", data:exitData}
			]
		};
				
		// 차트 생성
		createLineChart(lineChartData);
		
		// 초기 값 정보 조회
		let defaultEduArray =["입사","퇴사"];
		infoListByMonthlyHireExit(defaultEduArray);
		
		hrLineChart.on("clickLegendCheckbox",() => {
			const checkedLegend = hrLineChart.getCheckedLegend();
			//console.log(checkedLegend)
			if(checkedLegend){
				const hireExitArray = checkedLegend.map(item => item.label);
				infoListByMonthlyHireExit(hireExitArray);
			}
		});
		
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByMonthlyHireExit(hireExitArray){
	try{
		if (hireExitArray.length === 0) {
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
		console.log("입/퇴사자 정보:",result);
		empInfoList.resetData(result);
		
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
		
		// 데이터 설정
		const pieChartData = {
			categories: ["고용 유형"],
		    series: result.map(item => ({
				name: item.JOB_TYPE_NAME,
				data: item.COUNT_JOB_TYPE
			}))
		};
		
		// 차트 생성 
		createJobTypePieChart(pieChartData);
		
		// 초기 값 정보 조회
		let defaultEduArray =["일반직","계약직","기술직"];
		infoListByJobType(defaultEduArray);
		
		hrJobTypePieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = hrJobTypePieChart.getCheckedLegend();
			console.log(checkedLegend)
			if(checkedLegend){
				const jobTypeArray = checkedLegend.map(item => item.label);
				infoListByJobType(jobTypeArray);
			}
		});
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByJobType(jobTypeArray){
	try{
		if (jobTypeArray.length === 0) {
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
		console.log("고용유형별 정보:",result);
		empInfoList.resetData(result);
		
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
		
		// 데이터 설정
		const pieChartData = {
			categories: ["성과 등급"],
		    series: result.map(item => ({
				name: item.EMP_RANK_NAME,
				data: item.COUNT_RANK
			}))
		};
		
		// 차트 생성 
		createRankPieChart(pieChartData);
		
		// 초기 값 정보 조회
		let defaultEduArray =["A","B","C","D","F"];
		infoListByRank(defaultEduArray);
		
		hrRankPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = hrRankPieChart.getCheckedLegend();
			console.log(checkedLegend)
			if(checkedLegend){
				const rankArray = checkedLegend.map(item => item.label);
				infoListByRank(rankArray);
			}
		});
		
	}catch(error){
		console.error(error);
	}
}
async function infoListByRank(rankArray){
	try{
		if (rankArray.length === 0) {
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
		console.log("성과별 정보:",result);
		empInfoList.resetData(result);
		
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
