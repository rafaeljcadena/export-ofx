const bills = document.querySelectorAll("tr[tabindex='0']");
if (bills.length === 0) throw new Error('Elements not founded in this page');

const list = [];

let csvContent = "data:text/csv;charset=utf-8,";

let fallbackDate;
bills.forEach((item) => {
	const dateColumn = item.querySelector("td:nth-child(1) p");

	let dateValue;
	if (dateColumn) {
		dateValue = dateColumn.innerText;
		fallbackDate = dateColumn.innerText;
	} else {
		dateValue = fallbackDate;
	}

	const description = item.querySelector("td:nth-child(4) div p").innerText;
	const price = item.querySelector("td:nth-child(5) div div p").innerText;

	list.push(`${dateValue};${description};${price}`);
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
