'use strict';

const WeakMap = require('es6-weak-map');
const stringify = require('./stringify');
const parse  = require('./parse');

function initSyntax (syntax) {
	syntax.stringify = stringify.bind(syntax);
	syntax.parse = parse.bind(syntax);
	syntax.cache = new WeakMap();
	return syntax;
}

function syntax (config) {
	return initSyntax({
		config,
	});
}

initSyntax(syntax);
module.exports = syntax;
