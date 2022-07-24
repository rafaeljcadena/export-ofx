const { parseToDataObject, exportFile } = require('./utils.js');
const { myArgs, stdin, stdout } = process;

// TODO: Implementar o crédito tb
function render() {
	const lines = [];

	console.log('Copie e cole aqui as informações da fatura do Nubank:');
	const readline = require('readline');
	const rl = readline.createInterface({
		input: stdin,
		output: stdout,
		terminal: false
	});

	rl.on('line', function(line){
		if (line.match(/^\d\d\s[A-z]{3}$/)) line = "\n" + line.replace(/\n/, '') + ';'

		lines.push(line);
		if (line) return;

		let formattedLines = lines.join("").replace(/\t/g, ';')

		formattedLines = formattedLines.split("\n");
		formattedLines = formattedLines.filter(item => item);

		const dataArray = parseToDataObject(formattedLines);
		exportFile(dataArray, myArgs.bank);

		rl.close();
	});
}

module.exports = render;
