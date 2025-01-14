const Calendar = tui.Calendar;
	
	const container = document.getElementById('calendar');
	const options = {
	  defaultView: 'month',
	  timezone: {
	    zones: [
	      {
	        timezoneName: 'Asia/Seoul',
	        displayLabel: 'Seoul',
	      }
	     
	    ],
	  },
	  calendars: [
	    {
	      id: 'cal1',
	      name: '개인',
	      backgroundColor: '#03bd9e',
	    },
	    {
	      id: 'cal2',
	      name: '직장',
	      backgroundColor: '#00a9ff',
	    },
	  ],
	};

	const calendar = new Calendar(container, options);
	
	calendar.createEvents([
		  {
		    id: 'event1',
		    calendarId: 'cal2',
		    title: '주간 회의',
		    start: '2025-01-13T09:00:00',
		    end: '2025-01-13T18:00:00',
		  },
		  {
		    id: 'event2',
		    calendarId: 'cal1',
		    title: '점심 약속',
		    start: '2025-01-14T09:00:00',
		    end: '2025-01-14T18:00:00',
		  },
		  {
		    id: 'event3',
		    calendarId: 'cal2',
		    title: '휴가',
		    start: '2025-01-08',
		    end: '2025-01-08',
		    isAllday: true,
		    category: 'allday',
		  },
		]);


	