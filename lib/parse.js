const parser = require('./parser');
const getSyntax = require('./get-syntax');

function autoParse (code, opts) {
	const syntax = getSyntax(opts);
	const document = syntax.parse(code, opts);
	document.stringify = syntax.stringify;
	return document;
}

function parse (code, opts) {
	return parser(code, opts) || autoParse(code, opts);
}

module.exports = parse;
