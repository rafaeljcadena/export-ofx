const XLSX = require('xlsx');
const fs = require('fs');

// EXPORTAÇÃO VIA EXCEL
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

const { readInter, stringDateToOfxFormat, buildXML } = require('./utils.js');

const arrayObj = readInter();
const schema = buildXML(arrayObj);

fs.writeFile(`inter_${new Date().toLocaleString('pt-br').split(' ')[0].replaceAll('/','-')}.ofx`, schema.join(''), function (err) {
  if (err) throw err;
  console.log('File is created successfully.');
});
