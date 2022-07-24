// EXPORTAÇÃO VIA EXCEL
// const XLSX = require('xlsx');

//
// const workbook = XLSX.readFile('./arquivo_exemplo_pessoal.xls', {});
// const sheetName = workbook.SheetNames[0];
// const sheet = workbook.Sheets[sheetName];
// const json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

// const headers = json[0];

// const arrayObj = [];
// json.reduce((arr, row, index) => {
// 	if (row[0] === headers[0]) return;

// 	const [data, description, category, value] = row;
// 	if (!data) return;

// 	// console.log({ data, description, category, value });
// 	arrayObj.push({ id: `${data}-${description}`, data, description, category, value });
// });
// ------------------------------------

const myArgs = process.argv.reduce((acc, arg) => {
  const [name, value] = arg.split('=');

  if (name === 'bank') acc.bank = value;
  if (name === 'file') acc.file = value;

  return acc;
}, {});

process.myArgs = myArgs;

if (!myArgs.bank) throw new Error('Precisa informar o banco');

require(`./${myArgs.bank}.js`)();
