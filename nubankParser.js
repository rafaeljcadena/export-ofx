const bills = document.querySelectorAll('.charge.ng-scope');
if (bills.length === 0) throw new Error('Elements not founded in this page');

const list = [];

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

const encodedUri = encodeURI(csvContent);

const link = document.createElement("a");
link.setAttribute("href", encodedUri);

const filename = `nubank_${new Intl.DateTimeFormat('pt-BR', {month: 'long'}).format()}.csv`;

link.setAttribute("download", filename);
document.body.appendChild(link);
link.click();

link.remove();
