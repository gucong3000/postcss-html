'use strict';

const getSyntax = require('./get-syntax');

function autoParser (source, opts) {
	const syntax = getSyntax(opts);
	const document = syntax.parse(source, opts);
	document.stringify = syntax.stringify.bind(syntax, document);
	return document;
}

module.exports = autoParser;
