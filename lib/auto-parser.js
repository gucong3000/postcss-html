'use strict';

const getSyntax = require('./get-syntax');

function autoParser (source, opts) {
	const syntax = getSyntax(opts);
	const document = syntax.parse(source, opts);
	opts.syntax.cache.set(document, syntax);
	return document;
}

module.exports = autoParser;
