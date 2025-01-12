// toast ui grid
const Grid = tui.Grid;
Grid.applyTheme('clean'); // 테마 적용
const empInfoList = new Grid({
	el: document.getElementById('grid'),
	  data: [], // 초기 데이터
	  //rowHeaders: ['checkbox'],
	  //scrollX: false,
	  //scrollY: false,
	  bodyHeight: 200,
	  columns: [
	    { 
			header: '사원번호', 
			name: 'EMP_ID',
		},
	    { 
			header: '이름', 
			name: 'EMP_NAME',
		},
	    { 
			header: '부서명', 
			name: 'EMP_DEPT_NAME',
			//filter : 'select'
		},
	    { 
			header: '직급명', 
			name: 'EMP_POSITION_NAME',
			//filter : 'select'
		},
	    { 
			header: 'E-mail', 
			name: 'EMP_EMAIL',
			//filter : 'select'
		}
	  ],
	  columnOptions: {
	          resizable: true
	        }
});

// 카테고리 전환
const categoryMenu = document.getElementById("categoryMenu");
const empChartContainer = document.getElementById("empChartContainer");
let empPieChart, empGroupStackBarChart;

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", initChart);

categoryMenu.addEventListener("input",() => {
	const selectCategory = categoryMenu.value;
	console.log(selectCategory);
	
	if(selectCategory==="학력별"){
		empChartContainer.innerHTML = "<div id='empChart'></div>";
        countByEdu();
		//infoListByEdu();
	}else if(selectCategory==="연령별"){
		empChartContainer.innerHTML = "<div id='empGroupStackBarChart'></div>";
      	countByAgeAndGender();
		//infoListByAgeGroup();
	}
});

// 초기 메뉴에 따라 차트 생성
function initChart(){
	const defaultCategory = categoryMenu.value;
	
	if(defaultCategory === "학력별"){
		defaultCategory.innerHTML="<div id='empChart'></div>";
		countByEdu();
		//infoListByEdu();	
	}
	
	if(defaultCategory === "연령별"){
		defaultCategory.innerHTML = "<div id='empGroupStackBarChart'></div>";
		countByAgeAndGender();
		//infoListByAgeGroup();
	}
}

// toast ui chart
function createEmpPieChart(pieChartData){
	empPieChart = new toastui.Chart.pieChart({
		el : document.getElementById("empChart"),
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

function createEmpGroupStackBarChart(){
	empGroupStackBarChart = toastui.Chart.barChart({
		el : document.getElementById('empGroupStackBarChart'), 
		data : 	{
		        categories: [
		          '그 외',
		          '60 ~ 69',
		          '50 ~ 59',
		          '40 ~ 49',
		          '30 ~ 39',
		          '20 ~ 29',
		        ],
		        series: [
		          {
		            name: 'Male - Seoul',
		            data: [4007, 5067, 7221, 8358, 8500, 7730, 4962, 2670, 6700, 776, 131],
		            stackGroup: 'Male',
		          },
		          {
		            name: 'Female - Seoul',
		            data: [3805, 4728, 7244, 8291, 8530, 8126, 5483, 3161, 1274, 2217, 377],
		            stackGroup: 'Female',
		          },
		          {
		            name: 'Male - Incheon',
		            data: [1392, 1671, 2092, 2339, 2611, 2511, 1277, 6145, 1713, 1974, 194],
		            stackGroup: 'Male',
		          },
		          {
		            name: 'Female - Incheon',
		            data: [1320, 1558, 1927, 2212, 2556, 2433, 1304, 8076, 3800, 6057, 523],
		            stackGroup: 'Female',
		          },
		        ],
		      }, 
		options : {
			chart: { title: '연령별 인원 현황', width: 800, height: 550 },
	      	yAxis: { title: 'Age Group', align: 'center', },
	      	series: { stack: true, diverging: true, },
		}
	});
}

//
function test(){
	const checkedLegend = empPieChart.getCheckedLegend()
	console.log(checkedLegend);
}

// ajax
async function countByEdu(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-edu");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		const pieChartData = {
			categories: ["학력"],
		    series: result.map(item => ({
				name: item.EMP_EDU,
				data: item.EMP_COUNT_EDU
			}))
		};
		// 차트 생성 및 데이터 설정
		createEmpPieChart(pieChartData);
		
		//
		empPieChart.on("clickLegendCheckbox",test)
		
		const eduArray = result.map(item => item.EMP_EDU);
		infoListByEdu(eduArray);
		
	}catch(error){
		console.error(error);
	}
}

async function infoListByEdu(eduArray){
	try{
		const param = new URLSearchParams();
		eduArray.forEach(item => param.append("edu",item));
		//console.log(param.toString());
		
		const response = await fetch(`http://localhost:8082/api/infoList-by-edu?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
		
		empInfoList.resetData(result);
	}catch(error){
		console.error(error);
	}
}

async function countByAgeAndGender(){
	try{
		const response = await fetch("http://localhost:8082/api/count-by-ageGroupAndGender");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
			
	}catch(error){
		console.error(error);
	}
	
}

async function infoListByAgeGroup(){
	try{
		const response = await fetch("http://localhost:8082/api/infoList-by-ageGroup?ageGroup=");
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log(result);
	}catch(error){
		console.error(error);
	}
}


