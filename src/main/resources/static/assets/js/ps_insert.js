/*const SelectBox = tui.SelectBox;
const container1 = document.getElementById('selectBox');

const selectBox = new SelectBox(container, {
  data: [
    {
      label: 'Fruits',
      data: [ { label: 'Apple', value: 'apple', selected: true }, { label: 'Banana', value: 'banana' } ]
    }
  ]
});*/

// 생년월일
const empBirthDatePicker = new tui.DatePicker('#emp-birth-wrapper', {
       date: new Date(),
       input: {
           element: '#emp_birth',
           format: 'yyyy-MM-dd',
       },
	   language: 'ko',
   });
// 입사일
const empHireDatePicker = new tui.DatePicker('#emp-hire-date-wrapper', {
       date: new Date(),
       input: {
           element: '#emp_hire_date',
           format: 'yyyy-MM-dd',
       },
	   language: 'ko',
   });
// 퇴사일
const empExitDatePicker = new tui.DatePicker('#emp-exit-date-wrapper', {
       date: new Date(),
       input: {
           element: '#emp_exit_date',
           format: 'yyyy-MM-dd',
       },
	   language: 'ko',
   });  
