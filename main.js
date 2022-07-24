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

const { readInter, stringDateToOfxFormat, buildXML, readNubank } = require('./utils.js');
const { argv, stdin, stdout } = process;


const myArgs = argv.reduce((acc, arg) => {
  const [name, value] = arg.split('=');

  if (name === 'bank') acc.bank = value;
  if (name === 'file') acc.file = value;

  return acc;
}, {});


switch(myArgs.bank) {
  case 'nubank':
    console.log('Copie e cole aqui as informações da fatura do Nubank:');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
      terminal: false
    });

    const lines = [];
    rl.on('line', function(line){
      if (line.match(/^\d\d\s[A-z]{3}$/)) line = "\n" + line.replace(/\n/, '') + ';'

      lines.push(line);
      if (line) return;

      const formattedLines = lines.join("").replace(/\t/g, ';')
      myArgs.file = formattedLines;

      const arrayObj = readNubank(myArgs.file);
      main(arrayObj);

      rl.close();
    });


    break;
  case 'inter':
    const arrayObj = readInter(myArgs.file);
    main(arrayObj);

    break;
  default:
    console.log('Precisa informar o banco');
}

function main(arrayObj) {
  let schema;

  if (arrayObj) schema = buildXML(arrayObj);
  if (!schema) return;

  const exportFilename = myArgs.bank === 'nubank' ? 'nubank_' : 'inter_';
  fs.writeFile(`${exportFilename}${new Date().toLocaleString('pt-br').split(' ')[0].replaceAll('/','-')}.ofx`, schema.join(''), function (err) {
    if (err) throw err;
    console.log('Exportado com sucesso!');
  });

}
