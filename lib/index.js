'use strict';

const stringify = require('./stringify');
const parse  = require('./parse');

function syntax (config) {
	const syntax = {
		config,
	};
	syntax.stringify = stringify.bind(syntax);
	syntax.parse = parse.bind(syntax);
	return syntax;
}

syntax.stringify = stringify.bind(syntax);
syntax.parse = parse.bind(syntax);
module.exports = syntax;
