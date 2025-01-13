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
let empPieChart, empGroupStackBarChart;

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", initChart);

categoryMenu.addEventListener("input",() => {
	const selectCategory = categoryMenu.value;
	console.log(selectCategory);
	
	if(selectCategory==="학력별"){
		empChartContainer.innerHTML = "<div id='empChart'></div>";
        countByEdu();
	}else if(selectCategory==="연령별"){
		empChartContainer.innerHTML = "<div id='empGroupStackBarChart'></div>";
      	countByAgeAndGender();
	}
});

// 초기 메뉴에 따라 차트 생성
function initChart(){
	const defaultCategory = categoryMenu.value;
	
	if(defaultCategory === "학력별"){
		empChartContainer.innerHTML="<div id='empChart'></div>";
		countByEdu();
	}
	
	if(defaultCategory === "연령별"){
		empChartContainer.innerHTML = "<div id='empGroupStackBarChart'></div>";
		countByAgeAndGender();
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

function createEmpGroupBarChart(groupBarChartData){
	empGroupStackBarChart = toastui.Chart.barChart({
		el : document.getElementById('empGroupStackBarChart'), 
		data : groupBarChartData,
		options : {
			chart: { title: '연령별 인원 현황', width: 800, height: 550 },
	      	yAxis: { title: 'Age Group', align: 'center', },
	      	series: { stack: false, diverging: true },
		}
	});
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
		let defaultEduArray = result.map(item => item.EMP_EDU);
		// 초기 값 정보 조회
		infoListByEdu(defaultEduArray);
		
		empPieChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empPieChart.getCheckedLegend();
				if(checkedLegend){
					const eduArray = checkedLegend.map(item =>item.label);
					console.log(eduArray);
					infoListByEdu(eduArray);
				}
		});
		
	}catch(error){
		console.error(error);
	}
}

async function infoListByEdu(eduArray){
	try{
		if (eduArray.length === 0) {
	           console.log("차트라벨을 선택하지 않았습니다.(pieChart)");
	           empInfoList.resetData([]);
	           return;
	       }
		
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
		
   		const ageGroups = ['그 외', '60대', '50대', '40대', '30대', '20대'];
		
		const maleData = ageGroups.map(ageGroup => {
		   	const match = result.find(item => item.EMP_AGE_GROUP === ageGroup && item.EMP_GENDER === '남');
			//console.log(match);
		   	return match ? match.EMP_COUNT : 0;
        });
		// console.log("maleData : ",maleData);
		
		const femaleData = ageGroups.map(ageGroup => {
            const match = result.find(item => item.EMP_AGE_GROUP === ageGroup && item.EMP_GENDER === '여');
            return match ? match.EMP_COUNT : 0;
        });
		// console.log("femaleData : ",femaleData);
		
		
		const groupBarChartData = {
			categories : ageGroups,
			series :[
				{name: "남", data:maleData},
				{name: "여", data:femaleData}
			]
		};
		console.log("그룹바차트 data",groupBarChartData);
		// 차트 생성
		createEmpGroupBarChart(groupBarChartData);
		// 초기 값 정보 조회
		let defaultEduArray =["남","여"];
		infoListByAgeGroup(defaultEduArray);
		
		empGroupStackBarChart.on("clickLegendCheckbox",() => {
			const checkedLegend = empGroupStackBarChart.getCheckedLegend();
			//console.log("checkedLegend",checkedLegend);
			if(checkedLegend){
				const ageGroupArray = checkedLegend.map(item => item.label);
				infoListByAgeGroup(ageGroupArray);
			}
		});
			
	}catch(error){
		console.error(error);
	}
	
}

async function infoListByAgeGroup(ageGroupArray){
	try{
		if(ageGroupArray.length === 0){
				console.log("차트라벨을 선택하지 않았습니다.(groupBarChart)");
		        empInfoList.resetData([]);
			return;
		}
		
		const param = new URLSearchParams();
		ageGroupArray.forEach(item => param.append("ageGroupByGender",item));
		
		const response = await fetch(`http://localhost:8082/api/infoList-by-ageGroup?${param.toString()}`);
		if(!response.ok){
			throw new Error("네트워크 응답 실패");
		}
		const result = await response.json();
		console.log("성별 연령대 정보:",result);
		empInfoList.resetData(result);
		
	}catch(error){
		console.error(error);
	}
}


