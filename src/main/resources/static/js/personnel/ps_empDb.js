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
	
	// empChartContainer.innerHTML = "";
	
	if(selectCategory==="학력별"){
		empChartContainer.innerHTML = "<div id='empChart'></div>";
		createEmpPieChart();
	}else if(selectCategory==="연령별"){
		empChartContainer.innerHTML = "<div id='empGroupStackBarChart'></div>";
		createEmpGroupStackBarChart();
	}
});

// 초기 메뉴에 따라 차트 생성
function initChart(){
	const defaultCategory = categoryMenu.value;
	
	if(defaultCategory === "학력별"){
		defaultCategory.innerHTML="<div id='empChart'></div>";
		createEmpPieChart();	
	}
	
	if(defaultCategory === "연령별"){
		defaultCategory.innerHTML = "<div id='empGroupStackBarChart'></div>";
		createEmpGroupStackBarChart()
	}
}

// toast ui chart
function createEmpPieChart(){
	const empPieChart = new toastui.Chart.pieChart({
		el : document.getElementById("empChart"),
		data : {
		    categories: ['성별'],
		    series: [
		  	 {
		       name: '고졸',
		       data: 50,
		     },
		     {
		       name: '학사',
		       data: 45,
		     },
			 {
 		       name: '석사',
 		       data: 30,
 		     },
			 {
  		       name: '박사',
  		       data: 10,
  		     },
		   ],
		 },
	 	options : {
		   	chart: { title: "학력별 사원 현황", width: 700, height: 400 },
			series: {
			          radiusRange: {
			            inner: '40%',
			            outer: '100%',
			          },
			          angleRange: {
			            start: -90,
			            end: 90,
			          },
			          dataLabels: {
			            visible: true,
			            pieSeriesName: {
			              visible: true,
			              anchor: 'outer',
			            },
			          },
			        },
		 },
	});
}

function createEmpGroupStackBarChart(){
	const empGroupStackBarChart = toastui.Chart.barChart({
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







