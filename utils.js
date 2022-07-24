const MD5 = require('crypto-js/md5');
const fs = require('fs');

// TODO: Implementar para o caso de repetição de pagamentos com o mesmo valor
// Listar antes todos os items e ir analisando os casos repetidos e incrementando pra o hash ficar diferente
function readInter() {
	const data = fs.readFileSync('fatura-inter.csv', 'utf8');
	const headers = data.slice(0, data.indexOf("\n")).split(';');
	let dataArray = data.split("\n");
	dataArray = dataArray.slice(8, dataArray.length - 1);

	const dataFormatted = [];
	dataArray.forEach(item => {
		const [data, description, _type, value] = item.split(';');
		if (value.match(/-/)) return;

		const descriptionSanitized = description.replaceAll(/\s+$/g, '');
		const valueParsed = parseFloat(value.replace('.', '').replace(',', '.'));

		dataFormatted.push({ data, description: descriptionSanitized, value: valueParsed });
	});

	return dataFormatted;
}


function stringDateToOfxFormat(dateString) {
	const [day, month, year] = dateString.split('/');

	return new Date(`${month}-${day}-${year}`).toISOString().split('T')[0].replaceAll('-', '') + '000000[-3:GMT]';
}


function buildXML(arrayObj) {
	const startDateISO = new Date().toISOString().split('T')[0].replaceAll('-', '') + '000000[-3:GMT]';
	const endDateISO = stringDateToOfxFormat(arrayObj[arrayObj.length - 1].data);

	let schema = [];
	schema.push(`
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
`);

	schema.push('<OFX>');
	schema.push(`
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>

<DTSERVER>${startDateISO}
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
`);

	schema.push(`
<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1001
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
`);

	schema.push(`
<CCSTMTRS>
<CURDEF>BRL
<CCACCTFROM>
<ACCTID>${MD5(new Date().toTimeString()).toString()}
</CCACCTFROM>
`);

	schema.push('<BANKTRANLIST>');
	schema.push(`<DTSTART>${startDateISO}`);
	schema.push(`<DTEND>${endDateISO}`);

	arrayObj.forEach(item => {
		// arrayObj.push({ id: `${data}-${description}`, data, description, category, value });
		const { data, description, value } = item;

		schema.push(`
<STMTTRN>
	<TRNTYPE>DEBIT
	<DTPOSTED>${stringDateToOfxFormat(data)}
	<TRNAMT>${value}
	<FITID>${MD5(`${data}-${description}`).toString()}
	<MEMO>${description}
	</STMTTRN>
	`);
	});

	schema.push('</BANKTRANLIST>');


	const total = arrayObj.reduce((acc, item) => {
		let floatValue = parseFloat(item.value);
		if (floatValue < 0) floatValue = floatValue * -1;

		acc = acc + floatValue;
		return acc;
	}, 0.0);

	schema.push(`
	<LEDGERBAL>
	<BALAMT>${total}
	<DTASOF>${endDateISO}
	</LEDGERBAL>
`);

	schema.push(`
	</CCSTMTRS>
	</CCSTMTTRNRS>
	</CREDITCARDMSGSRSV1>
	</OFX>
`);

	return schema;
}

module.exports = {
	buildXML,
	stringDateToOfxFormat,
	readInter,
};
