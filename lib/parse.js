'use strict';

const parser = require('./parser');
const getSyntax = require('./get-syntax');

function autoParser (source, opts) {
	const syntax = getSyntax(opts);
	const document = syntax.parse(source, opts);
	document.stringify = syntax.stringify;
	return document;
}

function parse (source, opts) {
	if (!opts.syntax) {
		opts.syntax = this;
	}
	return parser(source, opts) || autoParser(source, opts);
}

module.exports = parse;
