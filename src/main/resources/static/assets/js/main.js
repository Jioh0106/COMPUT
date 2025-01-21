// 슬라이드 애니메이션 함수들
function slideToggle(t,e,o){0===t.clientHeight?j(t,e,o,!0):j(t,e,o)}
function slideUp(t,e,o){j(t,e,o)}
function slideDown(t,e,o){j(t,e,o,!0)}
function j(t,e,o,i){
    void 0===e&&(e=400),void 0===i&&(i=!1),t.style.overflow="hidden",i&&(t.style.display="block");
    var p,l=window.getComputedStyle(t),n=parseFloat(l.getPropertyValue("height")),
    a=parseFloat(l.getPropertyValue("padding-top")),s=parseFloat(l.getPropertyValue("padding-bottom")),
    r=parseFloat(l.getPropertyValue("margin-top")),d=parseFloat(l.getPropertyValue("margin-bottom")),
    g=n/e,y=a/e,m=s/e,u=r/e,h=d/e;
    window.requestAnimationFrame(function l(x){
        void 0===p&&(p=x);
        var f=x-p;
        i?(t.style.height=g*f+"px",t.style.paddingTop=y*f+"px",t.style.paddingBottom=m*f+"px",
        t.style.marginTop=u*f+"px",t.style.marginBottom=h*f+"px"):(t.style.height=n-g*f+"px",
        t.style.paddingTop=a-y*f+"px",t.style.paddingBottom=s-m*f+"px",t.style.marginTop=r-u*f+"px",
        t.style.marginBottom=d-h*f+"px"),f>=e?(t.style.height="",t.style.paddingTop="",
        t.style.paddingBottom="",t.style.marginTop="",t.style.marginBottom="",t.style.overflow="",
        i||(t.style.display="none"),"function"==typeof o&&o()):window.requestAnimationFrame(l)
    })
}

document.addEventListener('DOMContentLoaded', function() {
	// 오늘 날짜를 "yyyy년 MM월 dd일 (요일)" 형식으로 포맷
	function formatDateWithDay(date) {
	    const year = date.getFullYear();
	    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1 필요)
	    const day = String(date.getDate()).padStart(2, '0'); // 날짜를 두 자리로
	    const dayNames = ['일', '월', '화', '수', '목', '금', '토']; // 요일 배열
	    const dayName = dayNames[date.getDay()]; // 요일 가져오기
	    return `${year}년 ${month}월 ${day}일 (${dayName})`;
	}

	// 오늘 날짜 가져오기 및 todayDate에 출력
	const today = new Date();
	const formattedToday = formatDateWithDay(today);
	$('#todayDate').text(formattedToday); // 오늘 날짜 출력
	
	
    // 현재 경로에 해당하는 메뉴 활성화 및 서브메뉴 표시
    function activateCurrentMenu() {
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.sidebar-item, .submenu-item');
        
        // 모든 서브메뉴 닫기
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.style.display = 'none';
        });

        menuItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === currentPath) {
                // 기존 active 클래스 제거
                document.querySelectorAll('.sidebar-item.active, .submenu-item.active')
                    .forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                        }
                    });
                
                // 현재 항목 active
                item.classList.add('active');
                
                // 서브메뉴인 경우 부모 메뉴도 active하고 펼치기
                if (item.classList.contains('submenu-item')) {
                    const parentMenu = item.closest('.sidebar-item.has-sub');
                    if (parentMenu) {
                        parentMenu.classList.add('active');
                        const submenu = item.closest('.submenu');
                        if (submenu) {
                            submenu.style.display = 'block';
                        }
                    }
                }
            }
        });
    }

    // 서브메뉴 토글 설정
    let sidebarItems = document.querySelectorAll('.sidebar-item.has-sub');
    sidebarItems.forEach(item => {
        const link = item.querySelector('.sidebar-link');
        const submenu = item.querySelector('.submenu');
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 다른 서브메뉴 닫기
            sidebarItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherSubmenu = otherItem.querySelector('.submenu');
                    if (otherSubmenu && otherSubmenu.style.display === 'block') {
                        slideUp(otherSubmenu, 300);
                        otherSubmenu.classList.remove('active');
                    }
                }
            });

            // 현재 서브메뉴 토글
            if (submenu.style.display === 'block') {
                slideUp(submenu, 300);
                submenu.classList.remove('active');
            } else {
                slideDown(submenu, 300);
                submenu.classList.add('active');
            }
        });
    });

    // 서브메뉴 아이템 클릭 이벤트
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.submenu-item.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                }
            });
            item.classList.add('active');
        });
    });

    // 반응형 사이드바 처리
    function handleResize() {
        var w = window.innerWidth;
        if(w < 1200) {
            document.getElementById('sidebar').classList.remove('active');
        } else {
            document.getElementById('sidebar').classList.add('active');
        }
    }

    // 초기 실행
    activateCurrentMenu();
    handleResize();

    // 이벤트 리스너
    window.addEventListener('resize', handleResize);
    
    document.querySelector('.burger-btn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    document.querySelector('.sidebar-hide')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Perfect Scrollbar 초기화
    if(typeof PerfectScrollbar == 'function') {
        const container = document.querySelector(".sidebar-wrapper");
        const ps = new PerfectScrollbar(container, {
            wheelPropagation: false
        });
    }
});