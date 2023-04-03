bills = document.querySelectorAll('.charge.ng-scope');
list = [];

let csvContent = "data:text/csv;charset=utf-8,";

bills.forEach((item) => {
	const date = item.querySelector('.cell .date').innerText;
	const description = item.querySelector('.charge-data .description').innerText;
	const price = item.querySelector('.charge-data .amount').innerText;

	list.push(`${date};${description};${price}`);
});

list.forEach(item => {
   csvContent += item + "\n"
});

encodedUri = encodeURI(csvContent);
window.open(encodedUri);

