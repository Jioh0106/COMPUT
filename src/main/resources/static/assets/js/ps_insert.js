const SelectBox = tui.SelectBox;
const container = document.getElementById('selectBox');

const selectBox = new SelectBox(container, {
  data: [
    {
      label: 'Fruits',
      data: [ { label: 'Apple', value: 'apple', selected: true }, { label: 'Banana', value: 'banana' } ]
    }
  ]
});
