const { parseToDataObject, exportFile } = require('./utils.js');
const { myArgs, stdin, stdout } = process;

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
		lines.push(line);
		if (line) return;

		let formattedLines = [];
		for(var i = 2; i < lines.length; i = i + 3) {
			const date = lines[i - 2];
			const desc = lines[i - 1];
			const value = lines[i];

			formattedLines.push(`${date};${desc};${value}`);
		}

		const dataArray = parseToDataObject(formattedLines);
		exportFile(dataArray, myArgs.bank);

		rl.close();
	});
}

module.exports = render;
