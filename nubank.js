const { parseToDataObject, exportFile } = require('./utils.js');
const { myArgs, stdin, stdout } = process;
const fs = require('fs');

function render() {
	let lines;

	// console.log('Copie e cole aqui as informações da fatura do Nubank:');
	console.log('Digite o caminho do arquivo CSV');
	const readline = require('readline');
	const rl = readline.createInterface({
		input: stdin,
		output: stdout,
		terminal: false
	});

	rl.on('line', function(line){
		// lines.push(line);
		// if (line) return;

		try {
			const data = fs.readFileSync(line, 'utf8');
			lines = data.split("\n").filter((l) => l);
		} catch (err) {
			console.error(err);
		}

		// let formattedLines = [];
		// for(var i = 2; i < lines.length; i = i + 3) {
		// 	const date = lines[i - 2];
		// 	const desc = lines[i - 1];
		// 	const value = lines[i];

		// 	formattedLines.push(`${date};${desc};${value}`);
		// }

		// const dataArray = parseToDataObject(formattedLines);
		const dataArray = parseToDataObject(lines);
		exportFile(dataArray, myArgs.bank);

		rl.close();
	});


}

module.exports = render;
