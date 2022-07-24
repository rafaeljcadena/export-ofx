const { exportFile, parseToDataObject } = require('./utils.js');
const fs = require('fs');

// TODO: Implementar para o caso de repetição de pagamentos com o mesmo valor
// Listar antes todos os items e ir analisando os casos repetidos e incrementando pra o hash ficar diferente
function render() {
  try {
    const { bank, file } = process.myArgs;

    const data = fs.readFileSync(file, 'utf8');

    const headers = data.slice(0, data.indexOf("\n")).split(';');
    let dataArray = data.split("\n");
    dataArray = dataArray.slice(8, dataArray.length - 1);

    const dataFormatted = parseToDataObject(dataArray);
    exportFile(dataFormatted, bank);
  } catch(err) {
    console.error(err);
    return;
  }

}

module.exports = render;
