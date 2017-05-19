const stringify = require('./stringify');
const parse  = require('./parse');

function syntax (config) {
	return {
		config,
		stringify,
		parse,
	};
}

syntax.stringify = stringify;
syntax.parse = parse;
module.exports = syntax;
