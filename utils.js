const MD5 = require('crypto-js/md5');
const fs = require('fs');

function parseToDataObject(dataArray) {
	if (dataArray.length === 0) throw new Error('Não possui faturas para exportação');

	const { bank } = process.myArgs;

	const dataFormatted = [];
	dataArray.forEach(item => {
		const itemArray = item.split(';');

		let data;
		let description;
		let value;

		if (bank === 'inter') {
			data = itemArray[0];
			description = itemArray[1];
			value = itemArray[3];
		}

		if (bank === 'nubank') {
			data = nubankDateParser(itemArray[0]);

			description = itemArray[1];
			value = itemArray[2];
		}

		if (description.match(/Pagamento recebido/)) return;
		if (description.match(/Pagto Debito Automat/)) return;

		// if (value.match(/-/)) return;

		const descriptionSanitized = description.replaceAll(/\s+$/g, '');
		const valueParsed = parseFloat(value.replace('.', '').replace(',', '.'));

		const repeatedDataCount = dataFormatted.filter(d => d.data === data && d.description === descriptionSanitized && d.value === valueParsed).length;
		const repeatedSuffix = repeatedDataCount > 0 ? `-${repeatedDataCount}` : '';

		dataFormatted.push({ data, description: descriptionSanitized + repeatedSuffix, value: valueParsed });
	});

	return dataFormatted;
}

function nubankDateParser(rawDateString) {
	const currentYear = new Date().toDateString().match(/\d\d\d\d$/)[0]

	return new Date(Date.parse(`${rawDateString} ${currentYear}`)).toLocaleDateString('pt-br');
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
		const { data, description, value } = item;

		schema.push(`
<STMTTRN>
	<TRNTYPE>${value < 0 ? 'CREDIT' : 'DEBIT'}
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

function exportFile(arrayObj, bank) {
  let schema;

  if (arrayObj) schema = buildXML(arrayObj);
  if (!schema) return;

  fs.writeFile(`${bank}_${new Date().toLocaleString('pt-br').split(' ')[0].replaceAll('/','-')}.ofx`, schema.join(''), function (err) {
    if (err) throw err;
    console.log('Exportado com sucesso!');
  });

}

module.exports = {
	buildXML,
	stringDateToOfxFormat,
	parseToDataObject,
	exportFile,
};
